// PM Token ABI - Updated for deployed contract
export const PMTokenABI = [
  // Read functions
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "INITIAL_SUPPLY", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }], name: "transfer", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "sender", type: "address" }, { name: "recipient", type: "address" }, { name: "amount", type: "uint256" }], name: "transferFrom", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "burn", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "from", type: "address" }, { indexed: true, name: "to", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Transfer", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "owner", type: "address" }, { indexed: true, name: "spender", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Approval", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "previousOwner", type: "address" }, { indexed: true, name: "newOwner", type: "address" }], name: "OwnershipTransferred", type: "event" },
] as const;

// PM Multi-Round Presale ABI - Matches MultiRoundPresale.sol contract
export const PMPresaleABI = [
  // Read functions
  { inputs: [], name: "token", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tokenDecimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "presaleEnded", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "claimContract", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  // rounds getter (auto-generated from public array)
  { inputs: [{ name: "", type: "uint256" }], name: "rounds", outputs: [{ name: "price", type: "uint256" }, { name: "supply", type: "uint256" }, { name: "sold", type: "uint256" }, { name: "start", type: "uint256" }, { name: "end", type: "uint256" }, { name: "minBuy", type: "uint256" }, { name: "maxBuyTokens", type: "uint256" }, { name: "whitelistEnabled", type: "bool" }], stateMutability: "view", type: "function" },
  // View functions
  { inputs: [{ name: "r", type: "uint8" }, { name: "user", type: "address" }], name: "purchasedAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "r", type: "uint8" }, { name: "user", type: "address" }], name: "isWhitelisted", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "r", type: "uint8" }], name: "getRoundInfo", outputs: [{ name: "price", type: "uint256" }, { name: "supply", type: "uint256" }, { name: "sold", type: "uint256" }, { name: "start", type: "uint256" }, { name: "end", type: "uint256" }, { name: "minBuy", type: "uint256" }, { name: "maxBuyTokens", type: "uint256" }, { name: "whitelistEnabled", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalSold", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getActiveRound", outputs: [{ type: "int8" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "r", type: "uint8" }], name: "buyTokens", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "endPresale", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawUnsoldTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "r", type: "uint8" }, { name: "price", type: "uint256" }, { name: "supply", type: "uint256" }, { name: "start", type: "uint256" }, { name: "end", type: "uint256" }, { name: "minBuy", type: "uint256" }, { name: "maxBuyTokens", type: "uint256" }, { name: "whitelistEnabled", type: "bool" }], name: "configureRound", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "roundId", type: "uint8" }, { name: "users", type: "address[]" }, { name: "status", type: "bool" }], name: "setWhitelist", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "cc", type: "address" }], name: "setClaimContract", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "buyer", type: "address" }, { indexed: false, name: "round", type: "uint8" }, { indexed: false, name: "bnbAmount", type: "uint256" }, { indexed: false, name: "tokenAmount", type: "uint256" }], name: "TokensPurchased", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "round", type: "uint8" }], name: "RoundConfigured", type: "event" },
  { anonymous: false, inputs: [], name: "PresaleEnded", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "claimContract", type: "address" }], name: "ClaimContractSet", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "prev", type: "address" }, { indexed: true, name: "next", type: "address" }], name: "OwnershipTransferred", type: "event" },
] as const;

// PM Airdrop ABI
export const PMAirdropABI = [
  // Read functions
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "merkleRoot", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "airdropAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalClaimed", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "maxClaimable", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "startTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "endTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "isActive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTasks", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "hasClaimed", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "claimedAmount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "taskId", type: "uint256" }], name: "taskRewards", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getAirdropInfo", outputs: [{ name: "_airdropAmount", type: "uint256" }, { name: "_totalClaimed", type: "uint256" }, { name: "_maxClaimable", type: "uint256" }, { name: "_startTime", type: "uint256" }, { name: "_endTime", type: "uint256" }, { name: "_isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getUserInfo", outputs: [{ name: "_hasClaimed", type: "bool" }, { name: "_claimedAmount", type: "uint256" }, { name: "_completedTasks", type: "uint256[]" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "_merkleProof", type: "bytes32[]" }], name: "claim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_taskId", type: "uint256" }], name: "claimTask", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "AirdropClaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "taskId", type: "uint256" }, { indexed: false, name: "reward", type: "uint256" }], name: "TaskCompleted", type: "event" },
] as const;

// PM Staking ABI - Updated for 100/100 Audit Grade Contract
export const PMStakingABI = [
  // Read functions
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalStakedGlobal", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalRewardsDistributed", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "rewardPool", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "planCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "paused", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "totalStaked", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "planId", type: "uint256" }], name: "stakingPlans", outputs: [{ name: "duration", type: "uint256" }, { name: "apyRate", type: "uint256" }, { name: "minStake", type: "uint256" }, { name: "maxStake", type: "uint256" }, { name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "planId", type: "uint256" }], name: "getPlanInfo", outputs: [{ name: "duration", type: "uint256" }, { name: "apyRate", type: "uint256" }, { name: "minStake", type: "uint256" }, { name: "maxStake", type: "uint256" }, { name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getUserStakes", outputs: [{ components: [{ name: "amount", type: "uint256" }, { name: "planId", type: "uint256" }, { name: "startTime", type: "uint256" }, { name: "endTime", type: "uint256" }, { name: "lastClaimTime", type: "uint256" }, { name: "totalRewardsClaimed", type: "uint256" }, { name: "isActive", type: "bool" }], type: "tuple[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "id", type: "uint256" }], name: "calculateReward", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getGlobalStats", outputs: [{ name: "staked", type: "uint256" }, { name: "rewards", type: "uint256" }, { name: "_rewardPool", type: "uint256" }, { name: "plans", type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "amount", type: "uint256" }, { name: "planId", type: "uint256" }], name: "stake", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "id", type: "uint256" }], name: "unstake", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "id", type: "uint256" }], name: "emergencyUnstake", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "id", type: "uint256" }], name: "claimRewards", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "id", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "planId", type: "uint256" }], name: "Staked", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "id", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }], name: "Unstaked", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "id", type: "uint256" }, { indexed: false, name: "reward", type: "uint256" }], name: "RewardsClaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "id", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }], name: "EmergencyUnstake", type: "event" },
] as const;

// PM Swap ABI
export const PMSwapABI = [
  // Read functions
  { inputs: [], name: "pancakeRouter", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "pmToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "WBNB", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "swapFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeCollector", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalFeesCollected", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "token", type: "address" }], name: "supportedTokens", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_tokenIn", type: "address" }, { name: "_tokenOut", type: "address" }, { name: "_amountIn", type: "uint256" }], name: "getAmountOut", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "_tokenOut", type: "address" }, { name: "_amountOutMin", type: "uint256" }, { name: "_deadline", type: "uint256" }], name: "swapBNBForTokens", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_tokenIn", type: "address" }, { name: "_amountIn", type: "uint256" }, { name: "_amountOutMin", type: "uint256" }, { name: "_deadline", type: "uint256" }], name: "swapTokensForBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_tokenIn", type: "address" }, { name: "_tokenOut", type: "address" }, { name: "_amountIn", type: "uint256" }, { name: "_amountOutMin", type: "uint256" }, { name: "_deadline", type: "uint256" }], name: "swapTokensForTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "tokenIn", type: "address" }, { indexed: false, name: "tokenOut", type: "address" }, { indexed: false, name: "amountIn", type: "uint256" }, { indexed: false, name: "amountOut", type: "uint256" }, { indexed: false, name: "fee", type: "uint256" }], name: "Swapped", type: "event" },
] as const;

// PM Token Sender ABI
export const PMTokenSenderABI = [
  // Read functions
  { inputs: [], name: "serviceFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTransactionsSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalAmountSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userTransactionCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userTotalSent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getUserStats", outputs: [{ name: "transactionCount", type: "uint256" }, { name: "totalSent", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getGlobalStats", outputs: [{ name: "_totalTransactions", type: "uint256" }, { name: "_totalAmount", type: "uint256" }, { name: "_serviceFee", type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "_token", type: "address" }, { name: "_recipient", type: "address" }, { name: "_amount", type: "uint256" }], name: "sendToken", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_token", type: "address" }, { name: "_recipients", type: "address[]" }, { name: "_amounts", type: "uint256[]" }], name: "batchSendToken", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_token", type: "address" }, { name: "_recipients", type: "address[]" }, { name: "_amountPerRecipient", type: "uint256" }], name: "batchSendEqualAmount", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_recipients", type: "address[]" }, { name: "_amounts", type: "uint256[]" }], name: "batchSendBNB", outputs: [], stateMutability: "payable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: true, name: "token", type: "address" }, { indexed: false, name: "recipientCount", type: "uint256" }, { indexed: false, name: "totalAmount", type: "uint256" }], name: "BatchTransfer", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: true, name: "token", type: "address" }, { indexed: true, name: "recipient", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "SingleTransfer", type: "event" },
] as const;

// PM Token Locker ABI
export const PMTokenLockerABI = [
  // Read functions
  { inputs: [], name: "lockFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLocks", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalValueLocked", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "token", type: "address" }], name: "totalLockedByToken", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_lockId", type: "uint256" }], name: "getLock", outputs: [{ name: "token", type: "address" }, { name: "owner", type: "address" }, { name: "amount", type: "uint256" }, { name: "lockDate", type: "uint256" }, { name: "unlockDate", type: "uint256" }, { name: "withdrawn", type: "bool" }, { name: "description", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getUserLocks", outputs: [{ type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getUserActiveLocks", outputs: [{ components: [{ name: "token", type: "address" }, { name: "owner", type: "address" }, { name: "amount", type: "uint256" }, { name: "lockDate", type: "uint256" }, { name: "unlockDate", type: "uint256" }, { name: "withdrawn", type: "bool" }, { name: "description", type: "string" }], type: "tuple[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_token", type: "address" }], name: "getTokenLockInfo", outputs: [{ name: "totalLocked", type: "uint256" }, { name: "lockCount", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getGlobalStats", outputs: [{ name: "_totalLocks", type: "uint256" }, { name: "_totalValueLocked", type: "uint256" }, { name: "_lockFee", type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "_token", type: "address" }, { name: "_amount", type: "uint256" }, { name: "_unlockDate", type: "uint256" }, { name: "_description", type: "string" }], name: "lockTokens", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_lockId", type: "uint256" }], name: "unlockTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_lockId", type: "uint256" }, { name: "_newUnlockDate", type: "uint256" }], name: "extendLock", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "lockId", type: "uint256" }, { indexed: true, name: "token", type: "address" }, { indexed: true, name: "owner", type: "address" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "unlockDate", type: "uint256" }], name: "TokensLocked", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "lockId", type: "uint256" }, { indexed: true, name: "owner", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "TokensUnlocked", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "lockId", type: "uint256" }, { indexed: false, name: "newUnlockDate", type: "uint256" }], name: "LockExtended", type: "event" },
] as const;

// Legacy exports for backward compatibility
export const PMPaymentABI = PMTokenSenderABI;
export const PMReferralABI = PMAirdropABI;

// Re-export proper PMMerchantABI from dedicated file
export { PMMerchantABI } from './merchantABI';
