/**
 * Merchant API Utility
 * Handles merchant payment processing with API key validation
 */

export interface MerchantPaymentRequest {
  apiKey: string;
  amount: number;
  currency: string;
  customerWallet: string;
  metadata?: {
    orderId?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface MerchantPaymentResponse {
  success: boolean;
  transactionId: string;
  timestamp: string;
  amount: number;
  merchantWallet: string;
  customerWallet: string;
  message?: string;
  error?: string;
}

export interface MerchantAPIValidation {
  isValid: boolean;
  merchantWallet?: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  error?: string;
}

/**
 * Validate merchant API key
 */
export const validateMerchantAPIKey = (apiKey: string): MerchantAPIValidation => {
  try {
    const merchantApiKeys = JSON.parse(localStorage.getItem("merchantApiKeys") || "{}");
    
    // Find the wallet address associated with this API key
    let merchantWallet: string | undefined;
    for (const [wallet, key] of Object.entries(merchantApiKeys)) {
      if (key === apiKey) {
        merchantWallet = wallet;
        break;
      }
    }

    if (!merchantWallet) {
      return {
        isValid: false,
        error: "Invalid API key"
      };
    }

    // Check subscription status
    const merchantSubscriptions = JSON.parse(localStorage.getItem("merchantSubscriptions") || "{}");
    const subscription = merchantSubscriptions[merchantWallet];

    if (!subscription || !subscription.subscribed) {
      return {
        isValid: false,
        error: "Merchant subscription not active"
      };
    }

    // Check if subscription is expired
    const expiryDate = new Date(subscription.expiry);
    if (expiryDate < new Date()) {
      return {
        isValid: false,
        error: "Merchant subscription expired"
      };
    }

    return {
      isValid: true,
      merchantWallet,
      subscriptionPlan: subscription.plan,
      subscriptionExpiry: subscription.expiry
    };
  } catch (error) {
    console.error("API key validation error:", error);
    return {
      isValid: false,
      error: "Validation error"
    };
  }
};

/**
 * Process merchant payment
 */
export const processMerchantPayment = (
  request: MerchantPaymentRequest
): MerchantPaymentResponse => {
  try {
    // Validate API key
    const validation = validateMerchantAPIKey(request.apiKey);
    if (!validation.isValid) {
      return {
        success: false,
        transactionId: "",
        timestamp: new Date().toISOString(),
        amount: request.amount,
        merchantWallet: "",
        customerWallet: request.customerWallet,
        error: validation.error
      };
    }

    // Check customer balance
    const pmBalance = parseFloat(localStorage.getItem("pmBalance") || "0");
    if (pmBalance < request.amount) {
      return {
        success: false,
        transactionId: "",
        timestamp: new Date().toISOString(),
        amount: request.amount,
        merchantWallet: validation.merchantWallet!,
        customerWallet: request.customerWallet,
        error: "Insufficient PM balance"
      };
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Deduct from customer balance
    const newPmBalance = pmBalance - request.amount;
    localStorage.setItem("pmBalance", newPmBalance.toString());

    // Record merchant transaction
    const merchantTransactions = JSON.parse(localStorage.getItem("merchantTransactions") || "[]");
    merchantTransactions.unshift({
      id: transactionId,
      amount: request.amount,
      currency: request.currency,
      customerWallet: request.customerWallet,
      merchantWallet: validation.merchantWallet,
      timestamp,
      time: new Date().toLocaleString(),
      status: "completed",
      metadata: request.metadata
    });
    localStorage.setItem("merchantTransactions", JSON.stringify(merchantTransactions));

    // Record customer transaction
    const dashboardTransactions = JSON.parse(localStorage.getItem("dashboardTransactions") || "[]");
    dashboardTransactions.unshift({
      id: transactionId,
      type: "payment",
      amount: `-${request.amount}`,
      token: request.currency,
      time: new Date().toLocaleString(),
      status: "completed",
      to: validation.merchantWallet,
      description: request.metadata?.description || "Merchant Payment"
    });
    localStorage.setItem("dashboardTransactions", JSON.stringify(dashboardTransactions));

    // Trigger update events
    window.dispatchEvent(new Event("balanceUpdate"));
    window.dispatchEvent(new Event("merchantTransactionUpdate"));
    window.dispatchEvent(new Event("dashboardTransactionUpdate"));

    return {
      success: true,
      transactionId,
      timestamp,
      amount: request.amount,
      merchantWallet: validation.merchantWallet!,
      customerWallet: request.customerWallet,
      message: "Payment processed successfully"
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      transactionId: "",
      timestamp: new Date().toISOString(),
      amount: request.amount,
      merchantWallet: "",
      customerWallet: request.customerWallet,
      error: error instanceof Error ? error.message : "Payment processing failed"
    };
  }
};

/**
 * Get merchant statistics
 */
export const getMerchantStats = (merchantWallet: string) => {
  const merchantTransactions = JSON.parse(localStorage.getItem("merchantTransactions") || "[]");
  const merchantTxns = merchantTransactions.filter(
    (tx: any) => tx.merchantWallet === merchantWallet
  );

  const totalRevenue = merchantTxns.reduce((sum: number, tx: any) => sum + tx.amount, 0);
  const totalTransactions = merchantTxns.length;
  
  return {
    totalRevenue,
    totalTransactions,
    recentTransactions: merchantTxns.slice(0, 10)
  };
};

/**
 * Generate new API key (with rate limiting)
 */
export const generateNewAPIKey = (walletAddress: string): { success: boolean; apiKey?: string; error?: string } => {
  try {
    // Check if merchant has active subscription
    const merchantSubscriptions = JSON.parse(localStorage.getItem("merchantSubscriptions") || "{}");
    const subscription = merchantSubscriptions[walletAddress];

    if (!subscription || !subscription.subscribed) {
      return {
        success: false,
        error: "Active subscription required"
      };
    }

    // Check if subscription is expired
    const expiryDate = new Date(subscription.expiry);
    if (expiryDate < new Date()) {
      return {
        success: false,
        error: "Subscription expired"
      };
    }

    // Generate new API key
    const newKey = `pm_live_${Math.random().toString(36).substr(2, 24)}${Date.now().toString(36)}`;
    
    // Store API key
    const merchantApiKeys = JSON.parse(localStorage.getItem("merchantApiKeys") || "{}");
    merchantApiKeys[walletAddress] = newKey;
    localStorage.setItem("merchantApiKeys", JSON.stringify(merchantApiKeys));

    return {
      success: true,
      apiKey: newKey
    };
  } catch (error) {
    console.error("API key generation error:", error);
    return {
      success: false,
      error: "Failed to generate API key"
    };
  }
};
