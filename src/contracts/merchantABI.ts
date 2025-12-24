// PMMerchant ABI - Merchant Subscription and A/B Testing
export const PMMerchantABI = [
  // Read functions
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSubscribers", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalRevenue", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalActiveLinks", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "subscriptions", outputs: [
    { name: "tier", type: "uint8" },
    { name: "startTime", type: "uint256" },
    { name: "endTime", type: "uint256" },
    { name: "active", type: "bool" },
    { name: "amountPaid", type: "uint256" },
    { name: "totalRevenue", type: "uint256" },
    { name: "totalTransactions", type: "uint256" }
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tier", type: "uint8" }], name: "tierConfigs", outputs: [
    { name: "price", type: "uint256" },
    { name: "duration", type: "uint256" },
    { name: "transactionLimit", type: "uint256" },
    { name: "apiCallLimit", type: "uint256" },
    { name: "active", type: "bool" }
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "merchantTransactions", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "merchantApiCalls", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "merchantRevenue", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "isSubscriptionActive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "getSubscriptionInfo", outputs: [
    { name: "tier", type: "uint8" },
    { name: "endTime", type: "uint256" },
    { name: "active", type: "bool" },
    { name: "transactionsUsed", type: "uint256" },
    { name: "apiCallsUsed", type: "uint256" },
    { name: "transactionLimit", type: "uint256" },
    { name: "apiCallLimit", type: "uint256" },
    { name: "revenue", type: "uint256" },
    { name: "totalTx", type: "uint256" }
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tier", type: "uint8" }], name: "getTierConfig", outputs: [
    { name: "price", type: "uint256" },
    { name: "duration", type: "uint256" },
    { name: "transactionLimit", type: "uint256" },
    { name: "apiCallLimit", type: "uint256" },
    { name: "active", type: "bool" }
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "getMerchantStats", outputs: [
    { name: "revenue", type: "uint256" },
    { name: "transactions", type: "uint256" },
    { name: "activeLinks", type: "uint256" }
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "getABTestCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }, { name: "testId", type: "uint256" }], name: "getABTestResults", outputs: [
    { name: "name", type: "string" },
    { name: "conversions", type: "uint256" },
    { name: "impressions", type: "uint256" },
    { name: "conversionRate", type: "uint256" }
  ], stateMutability: "view", type: "function" },
  { inputs: [], name: "getGlobalStats", outputs: [
    { name: "_totalSubscribers", type: "uint256" },
    { name: "_totalRevenue", type: "uint256" },
    { name: "_starterPrice", type: "uint256" },
    { name: "_professionalPrice", type: "uint256" }
  ], stateMutability: "view", type: "function" },
  
  // Write functions
  { inputs: [{ name: "tier", type: "uint8" }], name: "subscribe", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "renewSubscription", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "cancelSubscription", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }, { name: "amount", type: "uint256" }], name: "recordTransaction", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "merchant", type: "address" }], name: "recordApiCall", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "variantAName", type: "string" }, { name: "variantBName", type: "string" }], name: "createABTest", outputs: [{ type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "testId", type: "uint256" }], name: "recordABTestImpression", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "testId", type: "uint256" }], name: "recordABTestConversion", outputs: [], stateMutability: "nonpayable", type: "function" },
  
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }, { indexed: false, name: "tier", type: "uint8" }, { indexed: false, name: "amount", type: "uint256" }], name: "SubscriptionPurchased", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }, { indexed: false, name: "tier", type: "uint8" }, { indexed: false, name: "amount", type: "uint256" }], name: "SubscriptionRenewed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }], name: "SubscriptionCancelled", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }, { indexed: true, name: "customer", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "PaymentReceived", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }, { indexed: false, name: "testId", type: "uint256" }, { indexed: false, name: "variantA", type: "string" }, { indexed: false, name: "variantB", type: "string" }], name: "ABTestCreated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "merchant", type: "address" }, { indexed: false, name: "testId", type: "uint256" }, { indexed: false, name: "variant", type: "uint256" }], name: "ABTestConversion", type: "event" },
] as const;
