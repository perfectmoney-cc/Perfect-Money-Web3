// PMSwap Contract ABI
export const PMSwapABI = [
  // Read functions
  { inputs: [], name: "pancakeRouter", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "WBNB", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "swapFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "MAX_FEE", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "BASIS_POINTS", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeCollector", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalFeesCollected", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSwapVolume", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSwapCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "token", type: "address" }], name: "supportedTokens", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userSwapCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userSwapVolume", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { 
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_tokenOut", type: "address" },
      { name: "_amountIn", type: "uint256" }
    ], 
    name: "getAmountOut", 
    outputs: [{ type: "uint256" }], 
    stateMutability: "view", 
    type: "function" 
  },
  {
    inputs: [],
    name: "getSwapStats",
    outputs: [
      { name: "_totalFeesCollected", type: "uint256" },
      { name: "_totalSwapVolume", type: "uint256" },
      { name: "_totalSwapCount", type: "uint256" },
      { name: "_currentFee", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserStats",
    outputs: [
      { name: "_swapCount", type: "uint256" },
      { name: "_swapVolume", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  {
    inputs: [
      { name: "_tokenOut", type: "address" },
      { name: "_amountOutMin", type: "uint256" },
      { name: "_deadline", type: "uint256" }
    ],
    name: "swapBNBForTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_amountIn", type: "uint256" },
      { name: "_amountOutMin", type: "uint256" },
      { name: "_deadline", type: "uint256" }
    ],
    name: "swapTokensForBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_tokenOut", type: "address" },
      { name: "_amountIn", type: "uint256" },
      { name: "_amountOutMin", type: "uint256" },
      { name: "_deadline", type: "uint256" }
    ],
    name: "swapTokensForTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { inputs: [{ name: "_token", type: "address" }, { name: "_supported", type: "bool" }], name: "setSupportedToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_fee", type: "uint256" }], name: "setSwapFee", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_collector", type: "address" }], name: "setFeeCollector", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_token", type: "address" }, { name: "_amount", type: "uint256" }], name: "withdrawTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { 
    anonymous: false, 
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "tokenIn", type: "address" },
      { indexed: false, name: "tokenOut", type: "address" },
      { indexed: false, name: "amountIn", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" }
    ], 
    name: "Swapped", 
    type: "event" 
  },
  { anonymous: false, inputs: [{ indexed: false, name: "newFee", type: "uint256" }], name: "FeeUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "newCollector", type: "address" }], name: "FeeCollectorUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "token", type: "address" }, { indexed: false, name: "supported", type: "bool" }], name: "TokenSupported", type: "event" },
] as const;

// PMTokenClaim Contract ABI
export const PMTokenClaimABI = [
  // Read functions
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "presaleContract", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "claimEnabled", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tgeTimestamp", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalClaimed", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "round", type: "uint8" }], name: "vestingConfigs", outputs: [{ name: "tgePercent", type: "uint256" }, { name: "cliffDuration", type: "uint256" }, { name: "vestingDuration", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "round", type: "uint8" }], name: "claimedAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "round", type: "uint8" }], name: "getClaimableAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getTotalClaimable", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getTotalPurchased", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getTotalClaimed", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserInfo",
    outputs: [
      { name: "purchased", type: "uint256[3]" },
      { name: "claimed", type: "uint256[3]" },
      { name: "claimable", type: "uint256[3]" },
      { name: "totalPurchased", type: "uint256" },
      { name: "totalClaimedUser", type: "uint256" },
      { name: "totalClaimableUser", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "round", type: "uint8" }],
    name: "getVestingInfo",
    outputs: [
      { name: "tgePercent", type: "uint256" },
      { name: "cliffDuration", type: "uint256" },
      { name: "vestingDuration", type: "uint256" },
      { name: "cliffEndTime", type: "uint256" },
      { name: "vestingEndTime", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  { inputs: [{ name: "round", type: "uint8" }], name: "claim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "claimAll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "enableClaim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_presale", type: "address" }], name: "setPresaleContract", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "round", type: "uint8" }, { name: "tgePercent", type: "uint256" }, { name: "cliffDuration", type: "uint256" }, { name: "vestingDuration", type: "uint256" }], name: "setVestingConfig", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "fundClaimPool", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], name: "emergencyWithdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: false, name: "tgeTimestamp", type: "uint256" }], name: "ClaimEnabled", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "round", type: "uint8" }, { indexed: false, name: "amount", type: "uint256" }], name: "TokensClaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "round", type: "uint8" }, { indexed: false, name: "tgePercent", type: "uint256" }, { indexed: false, name: "cliff", type: "uint256" }, { indexed: false, name: "vesting", type: "uint256" }], name: "VestingConfigUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "presaleContract", type: "address" }], name: "PresaleContractUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "token", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "EmergencyWithdraw", type: "event" },
] as const;

// ERC20 ABI for approval
export const ERC20_ABI = [
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// PMTokenSender Contract ABI
export const PMTokenSenderABI = [
  // Read functions
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "serviceFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTransactionsSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalAmountSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userTransactionCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userTotalSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserStats",
    outputs: [
      { name: "transactionCount", type: "uint256" },
      { name: "totalSent", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getGlobalStats",
    outputs: [
      { name: "_totalTransactions", type: "uint256" },
      { name: "_totalAmount", type: "uint256" },
      { name: "_serviceFee", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  {
    inputs: [
      { name: "_token", type: "address" },
      { name: "_recipient", type: "address" },
      { name: "_amount", type: "uint256" }
    ],
    name: "sendToken",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_token", type: "address" },
      { name: "_recipients", type: "address[]" },
      { name: "_amounts", type: "uint256[]" }
    ],
    name: "batchSendToken",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_token", type: "address" },
      { name: "_recipients", type: "address[]" },
      { name: "_amountPerRecipient", type: "uint256" }
    ],
    name: "batchSendEqualAmount",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_recipients", type: "address[]" },
      { name: "_amounts", type: "uint256[]" }
    ],
    name: "batchSendBNB",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: true, name: "token", type: "address" }, { indexed: true, name: "recipient", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "SingleTransfer", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: true, name: "token", type: "address" }, { indexed: false, name: "recipientCount", type: "uint256" }, { indexed: false, name: "totalAmount", type: "uint256" }], name: "BatchTransfer", type: "event" },
] as const;

// PMAirdrop Contract ABI - Simplified with flat BNB fees
export const PMAirdropABI = [
  // Read functions
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "merkleRoot", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalClaimed", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "maxClaimable", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "startTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "endTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "isActive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTasks", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "claimFeeBNB", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "networkFeeBNB", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalFeesCollected", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalNetworkFeesCollected", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeCollector", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "airdropAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "hasClaimed", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "claimedAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "taskId", type: "uint256" }], name: "taskCompleted", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "taskRewards", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "taskNames", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "taskLinks", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "taskEnabled", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  {
    inputs: [],
    name: "getFeeInfo",
    outputs: [
      { name: "claimFee", type: "uint256" },
      { name: "networkFee", type: "uint256" },
      { name: "totalFee", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_taskId", type: "uint256" }],
    name: "getTaskInfo",
    outputs: [
      { name: "name", type: "string" },
      { name: "link", type: "string" },
      { name: "reward", type: "uint256" },
      { name: "enabled", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllTasks",
    outputs: [
      { name: "names", type: "string[]" },
      { name: "links", type: "string[]" },
      { name: "rewards", type: "uint256[]" },
      { name: "enabledList", type: "bool[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTasks",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAirdropInfo",
    outputs: [
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
      { name: "_maxClaimable", type: "uint256" },
      { name: "_totalClaimed", type: "uint256" },
      { name: "_airdropAmount", type: "uint256" },
      { name: "_isActive", type: "bool" },
      { name: "_totalTasks", type: "uint256" },
      { name: "_merkleRoot", type: "bytes32" },
      { name: "_totalFeesCollected", type: "uint256" },
      { name: "_totalNetworkFeesCollected", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAdminInfo",
    outputs: [
      { name: "_owner", type: "address" },
      { name: "_feeCollector", type: "address" },
      { name: "_claimFeeBNB", type: "uint256" },
      { name: "_networkFeeBNB", type: "uint256" },
      { name: "_contractBalance", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Write functions (Admin)
  { inputs: [{ name: "_duration", type: "uint256" }, { name: "_maxClaimable", type: "uint256" }], name: "startAirdrop", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "endAirdrop", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "resumeAirdrop", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_merkleRoot", type: "bytes32" }], name: "setMerkleRoot", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_fee", type: "uint256" }], name: "setClaimFeeBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_fee", type: "uint256" }], name: "setNetworkFeeBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_collector", type: "address" }], name: "setFeeCollector", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_amount", type: "uint256" }], name: "setAirdropAmount", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_maxClaimable", type: "uint256" }], name: "setMaxClaimable", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_taskId", type: "uint256" }, { name: "_enabled", type: "bool" }], name: "setTaskEnabled", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "_taskId", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_link", type: "string" },
      { name: "_reward", type: "uint256" },
      { name: "_enabled", type: "bool" }
    ],
    name: "configureTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { inputs: [{ name: "_amount", type: "uint256" }], name: "withdrawTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawFees", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Write functions (User)
  { inputs: [{ name: "proof", type: "bytes32[]" }], name: "claim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "claimTask", outputs: [], stateMutability: "payable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "AirdropClaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "taskId", type: "uint256" }, { indexed: false, name: "reward", type: "uint256" }, { indexed: false, name: "claimFeePaid", type: "uint256" }, { indexed: false, name: "networkFeePaid", type: "uint256" }], name: "TaskCompleted", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "newFee", type: "uint256" }], name: "ClaimFeeUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "newFee", type: "uint256" }], name: "NetworkFeeUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "to", type: "address" }, { indexed: false, name: "claimFees", type: "uint256" }, { indexed: false, name: "networkFees", type: "uint256" }], name: "FeesWithdrawn", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "taskId", type: "uint256" }, { indexed: false, name: "name", type: "string" }, { indexed: false, name: "link", type: "string" }, { indexed: false, name: "reward", type: "uint256" }, { indexed: false, name: "enabled", type: "bool" }], name: "TaskConfigured", type: "event" },
] as const;

// PancakeSwap Pair ABI for liquidity info
export const PancakePairABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "_reserve0", type: "uint112" },
      { name: "_reserve1", type: "uint112" },
      { name: "_blockTimestampLast", type: "uint32" }
    ],
    stateMutability: "view",
    type: "function"
  },
  { inputs: [], name: "token0", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "token1", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;
