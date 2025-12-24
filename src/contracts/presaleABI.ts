// Multi-Round Presale Contract ABI for PM Token - Matches MultiRoundPresale.sol
export const PresaleABI = [
  // Read functions
  { inputs: [], name: "token", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tokenDecimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "presaleEnded", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "claimContract", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  // rounds getter (auto-generated from public array - returns struct without mappings)
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "rounds",
    outputs: [
      { name: "price", type: "uint256" },
      { name: "supply", type: "uint256" },
      { name: "sold", type: "uint256" },
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "minBuy", type: "uint256" },
      { name: "maxBuyTokens", type: "uint256" },
      { name: "whitelistEnabled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // View functions
  {
    inputs: [{ name: "r", type: "uint8" }],
    name: "getRoundInfo",
    outputs: [
      { name: "price", type: "uint256" },
      { name: "supply", type: "uint256" },
      { name: "sold", type: "uint256" },
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "minBuy", type: "uint256" },
      { name: "maxBuyTokens", type: "uint256" },
      { name: "whitelistEnabled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "r", type: "uint8" },
      { name: "user", type: "address" },
    ],
    name: "purchasedAmount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "r", type: "uint8" },
      { name: "user", type: "address" },
    ],
    name: "isWhitelisted",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "getTotalSold", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getActiveRound", outputs: [{ type: "int8" }], stateMutability: "view", type: "function" },
  // Write functions
  {
    inputs: [{ name: "r", type: "uint8" }],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { inputs: [], name: "endPresale", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawBNB", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawUnsoldTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "r", type: "uint8" },
      { name: "price", type: "uint256" },
      { name: "supply", type: "uint256" },
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "minBuy", type: "uint256" },
      { name: "maxBuyTokens", type: "uint256" },
      { name: "whitelistEnabled", type: "bool" },
    ],
    name: "configureRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "roundId", type: "uint8" },
      { name: "users", type: "address[]" },
      { name: "status", type: "bool" },
    ],
    name: "setWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "cc", type: "address" }],
    name: "setClaimContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "round", type: "uint8" },
      { indexed: false, name: "bnbAmount", type: "uint256" },
      { indexed: false, name: "tokenAmount", type: "uint256" },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "round", type: "uint8" }],
    name: "RoundConfigured",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "PresaleEnded", type: "event" },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "claimContract", type: "address" }],
    name: "ClaimContractSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "prev", type: "address" },
      { indexed: true, name: "next", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
] as const;

// PancakeSwap V3 Router ABI for swaps
export const PancakeSwapRouterABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)",
  "function WETH() view returns (address)",
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
] as const;

// Contract addresses
export const PRESALE_CONTRACT_ADDRESS = "0xD33ccE53eA96C7FBB1D734f44db2055a383E6709";
export const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap V2 Router

// Token addresses on BSC
export const BSC_TOKENS = {
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  PM: "0x181108f76d9910569203b5d59eb14Bc31961a989",
} as const;
