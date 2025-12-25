export const VIRTUAL_CARD_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_pmToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "cardNumber", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "tier", "type": "uint8" }
    ],
    "name": "CardCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "cashback", "type": "uint256" }
    ],
    "name": "CardSpent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }
    ],
    "name": "CardTopUp",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "CardWithdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "oldTier", "type": "uint8" },
      { "indexed": false, "internalType": "uint8", "name": "newTier", "type": "uint8" }
    ],
    "name": "TierUpgraded",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "cards",
    "outputs": [
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint8", "name": "tier", "type": "uint8" },
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "lastTopUpAt", "type": "uint256" },
      { "internalType": "string", "name": "cardNumber", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createCard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cardCreationFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }],
    "name": "setCardCreationFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getCardBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getCardInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint8", "name": "tier", "type": "uint8" },
          { "internalType": "uint256", "name": "balance", "type": "uint256" },
          { "internalType": "uint256", "name": "totalDeposited", "type": "uint256" },
          { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "lastTopUpAt", "type": "uint256" },
          { "internalType": "string", "name": "cardNumber", "type": "string" }
        ],
        "internalType": "struct PMVirtualCard.Card",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getCardNumber",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalCards", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalDeposits", "type": "uint256" },
      { "internalType": "uint256", "name": "_topUpFee", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint8", "name": "tier", "type": "uint8" }],
    "name": "getTierInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "minBalance", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyLimit", "type": "uint256" },
          { "internalType": "uint256", "name": "monthlyLimit", "type": "uint256" },
          { "internalType": "uint256", "name": "cashbackRate", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct PMVirtualCard.TierInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTier",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "hasCard",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pmToken",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }],
    "name": "setTopUpFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "spend",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "topUp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "topUpFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDeposits",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// PMVirtualCard Contract Address - BSC Mainnet
export const VIRTUAL_CARD_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update after deployment

// Extended ABI with additional functions for full contract interaction
export const PM_VIRTUAL_CARD_FULL_ABI = [
  ...VIRTUAL_CARD_ABI,
  // Additional admin functions
  {
    inputs: [
      { internalType: "uint8", name: "tier", type: "uint8" },
      { internalType: "uint256", name: "minBalance", type: "uint256" },
      { internalType: "uint256", name: "dailyLimit", type: "uint256" },
      { internalType: "uint256", name: "monthlyLimit", type: "uint256" },
      { internalType: "uint256", name: "cashbackRate", type: "uint256" }
    ],
    name: "setTierInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "freezeCard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "unfreezeCard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
