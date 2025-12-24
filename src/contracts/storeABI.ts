export const PMStoreABI = [
  // Product Management
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_imageUri", type: "string" },
      { internalType: "uint256", name: "_price", type: "uint256" },
      { internalType: "uint256", name: "_stock", type: "uint256" },
      { internalType: "uint8", name: "_category", type: "uint8" }
    ],
    name: "addProduct",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_productId", type: "uint256" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_imageUri", type: "string" },
      { internalType: "uint256", name: "_price", type: "uint256" },
      { internalType: "uint256", name: "_stock", type: "uint256" }
    ],
    name: "updateProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_productId", type: "uint256" },
      { internalType: "bool", name: "_isActive", type: "bool" }
    ],
    name: "setProductStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Voucher Management
  {
    inputs: [
      { internalType: "string", name: "_code", type: "string" },
      { internalType: "uint256", name: "_discountPercent", type: "uint256" },
      { internalType: "uint256", name: "_maxUses", type: "uint256" },
      { internalType: "uint256", name: "_expiresAt", type: "uint256" }
    ],
    name: "createVoucher",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "_code", type: "string" }],
    name: "deactivateVoucher",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Order Functions
  {
    inputs: [
      { internalType: "uint256[]", name: "_productIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "_quantities", type: "uint256[]" },
      { internalType: "string", name: "_shippingAddress", type: "string" },
      { internalType: "string", name: "_voucherCode", type: "string" }
    ],
    name: "createOrder",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_orderId", type: "uint256" },
      { internalType: "uint8", name: "_status", type: "uint8" }
    ],
    name: "updateOrderStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Rating Functions
  {
    inputs: [
      { internalType: "uint256", name: "_productId", type: "uint256" },
      { internalType: "uint8", name: "_rating", type: "uint8" }
    ],
    name: "rateProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "getProductRating",
    outputs: [
      { internalType: "uint256", name: "avgRating", type: "uint256" },
      { internalType: "uint256", name: "totalRatings", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_productId", type: "uint256" }
    ],
    name: "getUserRatedProduct",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "getProductRatings",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "productId", type: "uint256" },
          { internalType: "uint8", name: "rating", type: "uint8" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "bool", name: "rewarded", type: "bool" }
        ],
        internalType: "struct PMStore.Rating[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ratingReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_reward", type: "uint256" }],
    name: "setRatingReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // View Functions
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "imageUri", type: "string" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "uint256", name: "stock", type: "uint256" },
          { internalType: "uint8", name: "category", type: "uint8" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRatings", type: "uint256" },
          { internalType: "uint256", name: "ratingSum", type: "uint256" }
        ],
        internalType: "struct PMStore.Product",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_orderId", type: "uint256" }],
    name: "getOrder",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "buyer", type: "address" },
          { internalType: "uint256[]", name: "productIds", type: "uint256[]" },
          { internalType: "uint256[]", name: "quantities", type: "uint256[]" },
          { internalType: "uint256", name: "totalAmount", type: "uint256" },
          { internalType: "uint256", name: "discountApplied", type: "uint256" },
          { internalType: "string", name: "shippingAddress", type: "string" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" }
        ],
        internalType: "struct PMStore.Order",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserOrders",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "_code", type: "string" }],
    name: "getVoucher",
    outputs: [
      {
        components: [
          { internalType: "string", name: "code", type: "string" },
          { internalType: "uint256", name: "discountPercent", type: "uint256" },
          { internalType: "uint256", name: "maxUses", type: "uint256" },
          { internalType: "uint256", name: "usedCount", type: "uint256" },
          { internalType: "uint256", name: "expiresAt", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" }
        ],
        internalType: "struct PMStore.VoucherCode",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getActiveProducts",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "imageUri", type: "string" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "uint256", name: "stock", type: "uint256" },
          { internalType: "uint8", name: "category", type: "uint8" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRatings", type: "uint256" },
          { internalType: "uint256", name: "ratingSum", type: "uint256" }
        ],
        internalType: "struct PMStore.Product[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getStoreStats",
    outputs: [
      { internalType: "uint256", name: "_productCount", type: "uint256" },
      { internalType: "uint256", name: "_orderCount", type: "uint256" },
      { internalType: "uint256", name: "_totalRevenue", type: "uint256" },
      { internalType: "uint256", name: "_totalOrders", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "productCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "orderCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalRevenue",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalOrders",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalRatingsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  // Admin Functions
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_pmToken", type: "address" }],
    name: "setPMToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "category", type: "uint8" }
    ],
    name: "ProductAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "stock", type: "uint256" }
    ],
    name: "ProductUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "orderId", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "totalAmount", type: "uint256" }
    ],
    name: "OrderCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "orderId", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "status", type: "uint8" }
    ],
    name: "OrderStatusUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint8", name: "rating", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" }
    ],
    name: "ProductRated",
    type: "event"
  }
] as const;
