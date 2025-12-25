// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PMMerchant
 * @dev Merchant subscription and payment processing system
 */
contract PMMerchant is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    
    enum SubscriptionTier { None, Basic, Professional, Enterprise }
    
    struct Merchant {
        string businessName;
        string category;
        SubscriptionTier tier;
        uint256 subscriptionExpiry;
        uint256 totalVolume;
        uint256 totalTransactions;
        bool isActive;
        uint256 feeRate; // Custom fee rate in basis points
        address payoutAddress;
    }
    
    struct SubscriptionPlan {
        uint256 monthlyPrice;
        uint256 yearlyPrice;
        uint256 feeRate; // Transaction fee in basis points
        uint256 dailyLimit;
        bool isActive;
    }
    
    mapping(address => Merchant) public merchants;
    mapping(SubscriptionTier => SubscriptionPlan) public subscriptionPlans;
    address[] public merchantList;
    
    // Platform fees
    uint256 public platformFeeRate = 100; // 1% default
    uint256 public accumulatedFees;
    
    // Events
    event MerchantRegistered(address indexed merchant, string businessName, SubscriptionTier tier);
    event SubscriptionRenewed(address indexed merchant, SubscriptionTier tier, uint256 expiry);
    event PaymentProcessed(address indexed merchant, address indexed payer, uint256 amount, uint256 fee);
    event MerchantUpdated(address indexed merchant, string businessName);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _pmToken) {
        require(_pmToken != address(0), "Invalid token");
        pmToken = IERC20(_pmToken);
        
        // Initialize subscription plans
        subscriptionPlans[SubscriptionTier.Basic] = SubscriptionPlan({
            monthlyPrice: 100 * 1e18,    // 100 PM/month
            yearlyPrice: 1000 * 1e18,    // 1000 PM/year (2 months free)
            feeRate: 200,                 // 2% transaction fee
            dailyLimit: 10000 * 1e18,    // 10,000 PM daily limit
            isActive: true
        });
        
        subscriptionPlans[SubscriptionTier.Professional] = SubscriptionPlan({
            monthlyPrice: 500 * 1e18,
            yearlyPrice: 5000 * 1e18,
            feeRate: 150,                 // 1.5% transaction fee
            dailyLimit: 50000 * 1e18,
            isActive: true
        });
        
        subscriptionPlans[SubscriptionTier.Enterprise] = SubscriptionPlan({
            monthlyPrice: 2000 * 1e18,
            yearlyPrice: 20000 * 1e18,
            feeRate: 100,                 // 1% transaction fee
            dailyLimit: type(uint256).max,
            isActive: true
        });
    }
    
    // ============ Merchant Functions ============
    
    function registerMerchant(
        string calldata businessName,
        string calldata category,
        SubscriptionTier tier,
        bool yearly
    ) external whenNotPaused nonReentrant {
        require(merchants[msg.sender].subscriptionExpiry == 0, "Already registered");
        require(tier != SubscriptionTier.None, "Invalid tier");
        require(subscriptionPlans[tier].isActive, "Plan not available");
        
        SubscriptionPlan memory plan = subscriptionPlans[tier];
        uint256 price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
        uint256 duration = yearly ? 365 days : 30 days;
        
        pmToken.safeTransferFrom(msg.sender, address(this), price);
        
        merchants[msg.sender] = Merchant({
            businessName: businessName,
            category: category,
            tier: tier,
            subscriptionExpiry: block.timestamp + duration,
            totalVolume: 0,
            totalTransactions: 0,
            isActive: true,
            feeRate: plan.feeRate,
            payoutAddress: msg.sender
        });
        
        merchantList.push(msg.sender);
        accumulatedFees += price;
        
        emit MerchantRegistered(msg.sender, businessName, tier);
    }
    
    function renewSubscription(bool yearly) external whenNotPaused nonReentrant {
        Merchant storage merchant = merchants[msg.sender];
        require(merchant.subscriptionExpiry > 0, "Not registered");
        
        SubscriptionPlan memory plan = subscriptionPlans[merchant.tier];
        uint256 price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
        uint256 duration = yearly ? 365 days : 30 days;
        
        pmToken.safeTransferFrom(msg.sender, address(this), price);
        
        // Extend from current expiry or now, whichever is later
        uint256 startTime = merchant.subscriptionExpiry > block.timestamp 
            ? merchant.subscriptionExpiry 
            : block.timestamp;
        merchant.subscriptionExpiry = startTime + duration;
        
        accumulatedFees += price;
        
        emit SubscriptionRenewed(msg.sender, merchant.tier, merchant.subscriptionExpiry);
    }
    
    function upgradeTier(SubscriptionTier newTier, bool yearly) external whenNotPaused nonReentrant {
        Merchant storage merchant = merchants[msg.sender];
        require(merchant.subscriptionExpiry > 0, "Not registered");
        require(uint8(newTier) > uint8(merchant.tier), "Can only upgrade");
        require(subscriptionPlans[newTier].isActive, "Plan not available");
        
        SubscriptionPlan memory plan = subscriptionPlans[newTier];
        uint256 price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
        uint256 duration = yearly ? 365 days : 30 days;
        
        pmToken.safeTransferFrom(msg.sender, address(this), price);
        
        merchant.tier = newTier;
        merchant.feeRate = plan.feeRate;
        merchant.subscriptionExpiry = block.timestamp + duration;
        
        accumulatedFees += price;
        
        emit SubscriptionRenewed(msg.sender, newTier, merchant.subscriptionExpiry);
    }
    
    function updateMerchant(
        string calldata businessName,
        address payoutAddress
    ) external {
        Merchant storage merchant = merchants[msg.sender];
        require(merchant.subscriptionExpiry > 0, "Not registered");
        
        merchant.businessName = businessName;
        if (payoutAddress != address(0)) {
            merchant.payoutAddress = payoutAddress;
        }
        
        emit MerchantUpdated(msg.sender, businessName);
    }
    
    // ============ Payment Processing ============
    
    function processPayment(address merchantAddress, uint256 amount) external whenNotPaused nonReentrant {
        Merchant storage merchant = merchants[merchantAddress];
        require(merchant.isActive, "Merchant not active");
        require(merchant.subscriptionExpiry > block.timestamp, "Subscription expired");
        require(amount > 0, "Invalid amount");
        
        uint256 fee = (amount * merchant.feeRate) / 10000;
        uint256 merchantAmount = amount - fee;
        
        pmToken.safeTransferFrom(msg.sender, address(this), amount);
        pmToken.safeTransfer(merchant.payoutAddress, merchantAmount);
        
        merchant.totalVolume += amount;
        merchant.totalTransactions++;
        accumulatedFees += fee;
        
        emit PaymentProcessed(merchantAddress, msg.sender, amount, fee);
    }
    
    // ============ Admin Functions ============
    
    function setSubscriptionPlan(
        SubscriptionTier tier,
        uint256 monthlyPrice,
        uint256 yearlyPrice,
        uint256 feeRate,
        uint256 dailyLimit,
        bool isActive
    ) external onlyOwner {
        require(tier != SubscriptionTier.None, "Invalid tier");
        subscriptionPlans[tier] = SubscriptionPlan({
            monthlyPrice: monthlyPrice,
            yearlyPrice: yearlyPrice,
            feeRate: feeRate,
            dailyLimit: dailyLimit,
            isActive: isActive
        });
    }
    
    function setMerchantStatus(address merchantAddress, bool isActive) external onlyOwner {
        merchants[merchantAddress].isActive = isActive;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        pmToken.safeTransfer(owner(), amount);
        emit FeesWithdrawn(owner(), amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getMerchant(address merchantAddress) external view returns (Merchant memory) {
        return merchants[merchantAddress];
    }
    
    function isMerchantActive(address merchantAddress) external view returns (bool) {
        Merchant memory merchant = merchants[merchantAddress];
        return merchant.isActive && merchant.subscriptionExpiry > block.timestamp;
    }
    
    function getMerchantCount() external view returns (uint256) {
        return merchantList.length;
    }
    
    function getActiveMerchants() external view returns (address[] memory) {
        uint256 activeCount;
        for (uint i = 0; i < merchantList.length; i++) {
            if (merchants[merchantList[i]].isActive && merchants[merchantList[i]].subscriptionExpiry > block.timestamp) {
                activeCount++;
            }
        }
        
        address[] memory active = new address[](activeCount);
        uint256 index;
        for (uint i = 0; i < merchantList.length; i++) {
            if (merchants[merchantList[i]].isActive && merchants[merchantList[i]].subscriptionExpiry > block.timestamp) {
                active[index++] = merchantList[i];
            }
        }
        
        return active;
    }
}
