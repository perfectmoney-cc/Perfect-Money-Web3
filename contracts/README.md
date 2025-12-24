# PerfectMoney Smart Contracts

This directory contains all the Solidity smart contracts for the PerfectMoney ecosystem.

## Contracts Overview

### 1. PMToken.sol
Main ERC20 token contract with:
- 1 billion max supply
- 2% transfer tax
- Blacklist functionality
- Pausable transfers
- Tax exclusions for specific addresses

### 2. PMStaking.sol
Staking contract with multiple tier options:
- 30 days: 5% APY (min 100 PM)
- 90 days: 12% APY (min 500 PM)
- 180 days: 20% APY (min 1000 PM)
- 365 days: 35% APY (min 5000 PM)
- Early withdrawal penalty: 50% of rewards
- Claim rewards anytime

### 3. PMPayment.sol
Payment processing system:
- Direct peer-to-peer payments
- Payment link creation
- Payment history tracking
- Expirable payment links

### 4. PMReferral.sol
Multi-tier referral system:
- Bronze: 0+ referrals, 5% rewards
- Silver: 10+ referrals, 7.5% rewards
- Gold: 50+ referrals, 10% rewards
- Platinum: 100+ referrals, 15% rewards

### 5. PMMerchant.sol
Merchant subscription system:
- Starter: 100 PM/month (1000 tx, 10k API calls)
- Professional: 500 PM/month (10k tx, 100k API calls)
- Enterprise: 2000 PM/month (unlimited)

## Deployment Instructions

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

### 1. Create Hardhat Config
Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: "https://bsc-testnet.infura.io/v3/fa259a35d86740c692c60261ab4b0cdb",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY]
    },
    bscMainnet: {
      url: "https://bsc-mainnet.infura.io/v3/fa259a35d86740c692c60261ab4b0cdb",
      chainId: 56,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### 2. Create Deployment Script
Create `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy PMToken
  const PMToken = await hre.ethers.getContractFactory("PMToken");
  const taxWallet = deployer.address; // Change to your tax wallet
  const pmToken = await PMToken.deploy(taxWallet);
  await pmToken.waitForDeployment();
  console.log("PMToken deployed to:", await pmToken.getAddress());

  // Deploy PMStaking
  const PMStaking = await hre.ethers.getContractFactory("PMStaking");
  const pmStaking = await PMStaking.deploy(await pmToken.getAddress());
  await pmStaking.waitForDeployment();
  console.log("PMStaking deployed to:", await pmStaking.getAddress());

  // Deploy PMPayment
  const PMPayment = await hre.ethers.getContractFactory("PMPayment");
  const pmPayment = await PMPayment.deploy(await pmToken.getAddress());
  await pmPayment.waitForDeployment();
  console.log("PMPayment deployed to:", await pmPayment.getAddress());

  // Deploy PMReferral
  const PMReferral = await hre.ethers.getContractFactory("PMReferral");
  const pmReferral = await PMReferral.deploy(await pmToken.getAddress());
  await pmReferral.waitForDeployment();
  console.log("PMReferral deployed to:", await pmReferral.getAddress());

  // Deploy PMMerchant
  const PMMerchant = await hre.ethers.getContractFactory("PMMerchant");
  const pmMerchant = await PMMerchant.deploy(await pmToken.getAddress());
  await pmMerchant.waitForDeployment();
  console.log("PMMerchant deployed to:", await pmMerchant.getAddress());

  // Exclude contracts from tax
  await pmToken.setExcludedFromTax(await pmStaking.getAddress(), true);
  await pmToken.setExcludedFromTax(await pmPayment.getAddress(), true);
  await pmToken.setExcludedFromTax(await pmReferral.getAddress(), true);
  await pmToken.setExcludedFromTax(await pmMerchant.getAddress(), true);

  console.log("\n=== Deployment Complete ===");
  console.log("Update src/contracts/addresses.ts with these addresses");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 3. Deploy
```bash
# Test deployment
npx hardhat run scripts/deploy.js --network bscTestnet

# Mainnet deployment (when ready)
npx hardhat run scripts/deploy.js --network bscMainnet
```

### 4. Verify Contracts
```bash
npx hardhat verify --network bscTestnet DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

### 5. Update Frontend
After deployment, update `src/contracts/addresses.ts` with the deployed contract addresses.

## Security Considerations

1. **Audit Required**: Get contracts professionally audited before mainnet deployment
2. **Test Thoroughly**: Deploy to testnet and test all functions
3. **Owner Keys**: Use a multisig wallet for owner functions in production
4. **Rate Limits**: Monitor for unusual activity
5. **Emergency Pause**: Use pause functions if issues detected

## Testing

Create test files in `test/` directory:
```bash
npx hardhat test
```

## License
MIT
