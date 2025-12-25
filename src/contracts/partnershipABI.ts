export const PMPartnershipABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_pmToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "applicationId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "partner", "type": "address" }
    ],
    "name": "ApplicationApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "applicationId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "ApplicationRejected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "applicationId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "applicant", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" }
    ],
    "name": "ApplicationSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "tier", "type": "uint8" }
    ],
    "name": "PartnerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "oldTier", "type": "uint8" },
      { "indexed": false, "internalType": "uint8", "name": "newTier", "type": "uint8" }
    ],
    "name": "PartnerTierChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "name": "PartnerUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "partner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "RevenuePaid",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_partnerType", "type": "string" },
      { "internalType": "string", "name": "_country", "type": "string" },
      { "internalType": "string", "name": "_city", "type": "string" },
      { "internalType": "int256", "name": "_latitude", "type": "int256" },
      { "internalType": "int256", "name": "_longitude", "type": "int256" },
      { "internalType": "uint8", "name": "_tier", "type": "uint8" }
    ],
    "name": "addPartner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "applicationCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "applicationFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_applicationId", "type": "uint256" }],
    "name": "approveApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_applicationId", "type": "uint256" }],
    "name": "getApplication",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "applicant", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "email", "type": "string" },
          { "internalType": "string", "name": "partnerType", "type": "string" },
          { "internalType": "string", "name": "country", "type": "string" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "appliedAt", "type": "uint256" },
          { "internalType": "string", "name": "rejectionReason", "type": "string" }
        ],
        "internalType": "struct PMPartnership.Application",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPartners",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalPartners", "type": "uint256" },
      { "internalType": "uint256", "name": "_activePartners", "type": "uint256" },
      { "internalType": "uint256", "name": "_pendingApplications", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalRevenuePaid", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
    "name": "getPartner",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "wallet", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "partnerType", "type": "string" },
          { "internalType": "string", "name": "country", "type": "string" },
          { "internalType": "string", "name": "city", "type": "string" },
          { "internalType": "int256", "name": "latitude", "type": "int256" },
          { "internalType": "int256", "name": "longitude", "type": "int256" },
          { "internalType": "uint8", "name": "tier", "type": "uint8" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint256", "name": "totalRevenue", "type": "uint256" },
          { "internalType": "uint256", "name": "joinedAt", "type": "uint256" },
          { "internalType": "uint256", "name": "lastPayout", "type": "uint256" }
        ],
        "internalType": "struct PMPartnership.Partner",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPartnerCount",
    "outputs": [
      { "internalType": "uint256", "name": "total", "type": "uint256" },
      { "internalType": "uint256", "name": "active", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint8", "name": "_tier", "type": "uint8" }],
    "name": "getTierInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "revenueShare", "type": "uint256" },
          { "internalType": "uint256", "name": "minMonthlyVolume", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct PMPartnership.TierInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
    "name": "isPartner",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minPayout",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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
    "inputs": [{ "internalType": "address", "name": "_partner", "type": "address" }],
    "name": "payoutRevenue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_partner", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }],
    "name": "recordRevenue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_applicationId", "type": "uint256" }, { "internalType": "string", "name": "_reason", "type": "string" }],
    "name": "rejectApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }],
    "name": "setApplicationFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_minPayout", "type": "uint256" }],
    "name": "setMinPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "_tier", "type": "uint8" },
      { "internalType": "uint256", "name": "_revenueShare", "type": "uint256" },
      { "internalType": "uint256", "name": "_minVolume", "type": "uint256" },
      { "internalType": "bool", "name": "_isActive", "type": "bool" }
    ],
    "name": "setTierInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_email", "type": "string" },
      { "internalType": "string", "name": "_partnerType", "type": "string" },
      { "internalType": "string", "name": "_country", "type": "string" }
    ],
    "name": "submitApplication",
    "outputs": [],
    "stateMutability": "payable",
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
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" },
      { "internalType": "string", "name": "_city", "type": "string" },
      { "internalType": "int256", "name": "_latitude", "type": "int256" },
      { "internalType": "int256", "name": "_longitude", "type": "int256" }
    ],
    "name": "updatePartnerLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }, { "internalType": "bool", "name": "_isActive", "type": "bool" }],
    "name": "updatePartnerStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }, { "internalType": "uint8", "name": "_newTier", "type": "uint8" }],
    "name": "upgradePartnerTier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "stateMutability": "payable", "type": "receive" }
] as const;

export const PM_PARTNERSHIP_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update after deployment
