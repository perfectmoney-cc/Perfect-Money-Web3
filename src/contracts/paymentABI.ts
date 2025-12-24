// PMPayment Contract ABI
export const paymentABI = [
  // Constructor
  {
    inputs: [
      { internalType: "address", name: "_pmToken", type: "address" },
      { internalType: "address", name: "_usdtToken", type: "address" },
      { internalType: "address", name: "_usdcToken", type: "address" },
      { internalType: "address", name: "_feeCollector", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "merchant", type: "address" },
      { indexed: false, internalType: "string", name: "merchantId", type: "string" }
    ],
    name: "MerchantRegistered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "merchant", type: "address" }
    ],
    name: "MerchantUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "paymentHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "paymentId", type: "string" },
      { indexed: false, internalType: "address", name: "merchant", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "currency", type: "uint8" }
    ],
    name: "PaymentCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "paymentHash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "customer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "PaymentCompleted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "paymentHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "reason", type: "string" }
    ],
    name: "PaymentFailed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "paymentHash", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "PaymentRefunded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "merchant", type: "address" },
      { indexed: false, internalType: "bool", name: "acceptPM", type: "bool" },
      { indexed: false, internalType: "bool", name: "acceptUSDT", type: "bool" },
      { indexed: false, internalType: "bool", name: "acceptUSDC", type: "bool" },
      { indexed: false, internalType: "bool", name: "acceptBNB", type: "bool" }
    ],
    name: "WidgetConfigured",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "merchant", type: "address" },
      { indexed: true, internalType: "bytes32", name: "paymentHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "eventType", type: "string" }
    ],
    name: "WebhookTriggered",
    type: "event"
  },
  
  // Read Functions
  {
    inputs: [],
    name: "pmToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "usdtToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "usdcToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "platformFeeRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeCollector",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "paymentExpiryTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalPaymentsProcessed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalVolumeProcessed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalMerchants",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "merchant", type: "address" }],
    name: "merchants",
    outputs: [
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "uint256", name: "totalRevenue", type: "uint256" },
      { internalType: "uint256", name: "totalTransactions", type: "uint256" },
      { internalType: "uint256", name: "feeRate", type: "uint256" },
      { internalType: "string", name: "webhookUrl", type: "string" },
      { internalType: "uint256", name: "registeredAt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "getPayment",
    outputs: [
      {
        components: [
          { internalType: "string", name: "paymentId", type: "string" },
          { internalType: "address", name: "merchant", type: "address" },
          { internalType: "address", name: "customer", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint8", name: "currency", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "string", name: "orderId", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "completedAt", type: "uint256" },
          { internalType: "bytes32", name: "txHash", type: "bytes32" }
        ],
        internalType: "struct PMPayment.Payment",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "merchant", type: "address" }],
    name: "getMerchant",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "totalRevenue", type: "uint256" },
          { internalType: "uint256", name: "totalTransactions", type: "uint256" },
          { internalType: "uint256", name: "feeRate", type: "uint256" },
          { internalType: "string", name: "webhookUrl", type: "string" },
          { internalType: "uint256", name: "registeredAt", type: "uint256" }
        ],
        internalType: "struct PMPayment.Merchant",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "merchant", type: "address" }],
    name: "getMerchantPayments",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "customer", type: "address" }],
    name: "getCustomerPayments",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "merchant", type: "address" }],
    name: "getWidgetConfig",
    outputs: [
      {
        components: [
          { internalType: "string", name: "merchantId", type: "string" },
          { internalType: "bool", name: "acceptPM", type: "bool" },
          { internalType: "bool", name: "acceptUSDT", type: "bool" },
          { internalType: "bool", name: "acceptUSDC", type: "bool" },
          { internalType: "bool", name: "acceptBNB", type: "bool" },
          { internalType: "uint256", name: "minAmount", type: "uint256" },
          { internalType: "uint256", name: "maxAmount", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" }
        ],
        internalType: "struct PMPayment.WidgetConfig",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "isPaymentExpired",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "merchantId", type: "string" }],
    name: "merchantIdToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  
  // Write Functions
  {
    inputs: [
      { internalType: "string", name: "merchantId", type: "string" },
      { internalType: "string", name: "webhookUrl", type: "string" }
    ],
    name: "registerMerchant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "webhookUrl", type: "string" }],
    name: "updateWebhook",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "merchantId", type: "string" },
      { internalType: "bool", name: "acceptPM", type: "bool" },
      { internalType: "bool", name: "acceptUSDT", type: "bool" },
      { internalType: "bool", name: "acceptUSDC", type: "bool" },
      { internalType: "bool", name: "acceptBNB", type: "bool" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" }
    ],
    name: "configureWidget",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "paymentId", type: "string" },
      { internalType: "address", name: "merchant", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint8", name: "currency", type: "uint8" },
      { internalType: "string", name: "orderId", type: "string" }
    ],
    name: "createPayment",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "payWithPM",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "payWithUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "payWithUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "payWithBNB",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "paymentHash", type: "bytes32" }],
    name: "refundPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  
  // Admin Functions
  {
    inputs: [{ internalType: "uint256", name: "newRate", type: "uint256" }],
    name: "setPlatformFeeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newCollector", type: "address" }],
    name: "setFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "newTime", type: "uint256" }],
    name: "setPaymentExpiryTime",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "merchant", type: "address" },
      { internalType: "uint256", name: "feeRate", type: "uint256" }
    ],
    name: "setMerchantFeeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "withdrawStuckTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawStuckBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Contract addresses (to be updated after deployment)
export const PAYMENT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Payment currency enum values
export const PaymentCurrency = {
  PM: 0,
  USDT: 1,
  USDC: 2,
  BNB: 3
} as const;

// Payment status enum values
export const PaymentStatus = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2,
  REFUNDED: 3,
  EXPIRED: 4
} as const;
