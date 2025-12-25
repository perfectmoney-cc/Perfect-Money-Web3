// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PMVirtualCard
 * @dev Virtual Card system for Perfect Money ecosystem
 * Features: Card creation, top-up, spend with cashback, tier upgrades, freeze/unfreeze
 */
contract PMVirtualCard is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    
    // Card creation fee in BNB
    uint256 public cardCreationFee = 0.005 ether;
    
    // Top-up fee in basis points (100 = 1%)
    uint256 public topUpFee = 100; // 1% default
    
    // Accumulated fees
    uint256 public accumulatedFees;
    uint256 public accumulatedBNBFees;
    
    // Tier definitions
    enum Tier { Standard, Bronze, Silver, Gold, Platinum, Diamond }
    
    struct TierInfo {
        uint256 minBalance;      // Minimum balance required for tier
        uint256 dailyLimit;      // Daily spending limit
        uint256 monthlyLimit;    // Monthly spending limit
        uint256 cashbackRate;    // Cashback rate in basis points (50 = 0.5%)
        bool isActive;           // Tier availability
    }
    
    struct Card {
        bool isActive;
        Tier tier;
        uint256 balance;
        uint256 totalDeposited;
        uint256 totalSpent;
        uint256 totalCashback;
        uint256 createdAt;
        uint256 lastTopUpAt;
        uint256 dailySpent;
        uint256 lastDailyReset;
        uint256 monthlySpent;
        uint256 lastMonthlyReset;
        string cardNumber;
        bool isFrozen;
    }
    
    mapping(address => Card) public cards;
    mapping(Tier => TierInfo) public tiers;
    address[] public cardHolders;
    
    // Stats
    uint256 public totalCards;
    uint256 public totalDeposits;
    uint256 public totalSpending;
    uint256 public totalCashbackPaid;
    
    // Events
    event CardCreated(address indexed user, string cardNumber, Tier tier);
    event CardTopUp(address indexed user, uint256 amount, uint256 fee, uint256 newBalance);
    event CardSpent(address indexed user, uint256 amount, uint256 cashback, address merchant);
    event CardWithdraw(address indexed user, uint256 amount);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier);
    event CardFrozen(address indexed user);
    event CardUnfrozen(address indexed user);
    event FeesWithdrawn(address indexed owner, uint256 pmAmount, uint256 bnbAmount);
    event TierInfoUpdated(Tier tier, uint256 minBalance, uint256 dailyLimit, uint256 monthlyLimit, uint256 cashbackRate);
    
    constructor(address _pmToken) {
        require(_pmToken != address(0), "Invalid token address");
        pmToken = IERC20(_pmToken);
        
        // Initialize default tier info
        tiers[Tier.Standard] = TierInfo({
            minBalance: 0,
            dailyLimit: 1000 ether,
            monthlyLimit: 10000 ether,
            cashbackRate: 50, // 0.5%
            isActive: true
        });
        
        tiers[Tier.Bronze] = TierInfo({
            minBalance: 1000 ether,
            dailyLimit: 5000 ether,
            monthlyLimit: 50000 ether,
            cashbackRate: 100, // 1%
            isActive: true
        });
        
        tiers[Tier.Silver] = TierInfo({
            minBalance: 5000 ether,
            dailyLimit: 10000 ether,
            monthlyLimit: 100000 ether,
            cashbackRate: 150, // 1.5%
            isActive: true
        });
        
        tiers[Tier.Gold] = TierInfo({
            minBalance: 10000 ether,
            dailyLimit: 25000 ether,
            monthlyLimit: 250000 ether,
            cashbackRate: 200, // 2%
            isActive: true
        });
        
        tiers[Tier.Platinum] = TierInfo({
            minBalance: 50000 ether,
            dailyLimit: 100000 ether,
            monthlyLimit: 1000000 ether,
            cashbackRate: 250, // 2.5%
            isActive: true
        });
        
        tiers[Tier.Diamond] = TierInfo({
            minBalance: 100000 ether,
            dailyLimit: type(uint256).max,
            monthlyLimit: type(uint256).max,
            cashbackRate: 300, // 3%
            isActive: true
        });
    }
    
    // ============ Card Creation ============
    
    function createCard() external payable whenNotPaused nonReentrant {
        require(!hasCard(msg.sender), "Card already exists");
        require(msg.value >= cardCreationFee, "Insufficient BNB for card creation");
        
        string memory cardNum = _generateCardNumber(msg.sender);
        
        cards[msg.sender] = Card({
            isActive: true,
            tier: Tier.Standard,
            balance: 0,
            totalDeposited: 0,
            totalSpent: 0,
            totalCashback: 0,
            createdAt: block.timestamp,
            lastTopUpAt: 0,
            dailySpent: 0,
            lastDailyReset: block.timestamp,
            monthlySpent: 0,
            lastMonthlyReset: block.timestamp,
            cardNumber: cardNum,
            isFrozen: false
        });
        
        cardHolders.push(msg.sender);
        totalCards++;
        accumulatedBNBFees += msg.value;
        
        emit CardCreated(msg.sender, cardNum, Tier.Standard);
    }
    
    // ============ Top-Up Functions ============
    
    function topUp(uint256 amount) external whenNotPaused nonReentrant {
        require(hasCard(msg.sender), "No card found");
        require(!cards[msg.sender].isFrozen, "Card is frozen");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 fee = (amount * topUpFee) / 10000;
        uint256 netAmount = amount - fee;
        
        pmToken.safeTransferFrom(msg.sender, address(this), amount);
        
        cards[msg.sender].balance += netAmount;
        cards[msg.sender].totalDeposited += netAmount;
        cards[msg.sender].lastTopUpAt = block.timestamp;
        
        accumulatedFees += fee;
        totalDeposits += netAmount;
        
        // Check for tier upgrade eligibility
        _checkAndUpgradeTier(msg.sender);
        
        emit CardTopUp(msg.sender, amount, fee, cards[msg.sender].balance);
    }
    
    // ============ Spending Functions ============
    
    function spend(uint256 amount) external whenNotPaused nonReentrant {
        _spend(msg.sender, amount, address(0));
    }
    
    function spendAtMerchant(uint256 amount, address merchant) external whenNotPaused nonReentrant {
        _spend(msg.sender, amount, merchant);
    }
    
    function _spend(address user, uint256 amount, address merchant) internal {
        require(hasCard(user), "No card found");
        require(!cards[user].isFrozen, "Card is frozen");
        require(cards[user].isActive, "Card is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(cards[user].balance >= amount, "Insufficient balance");
        
        // Reset daily/monthly limits if needed
        _resetLimitsIfNeeded(user);
        
        TierInfo memory tierData = tiers[cards[user].tier];
        require(cards[user].dailySpent + amount <= tierData.dailyLimit, "Daily limit exceeded");
        require(cards[user].monthlySpent + amount <= tierData.monthlyLimit, "Monthly limit exceeded");
        
        // Calculate cashback
        uint256 cashback = (amount * tierData.cashbackRate) / 10000;
        
        cards[user].balance -= amount;
        cards[user].balance += cashback; // Add cashback back
        cards[user].totalSpent += amount;
        cards[user].totalCashback += cashback;
        cards[user].dailySpent += amount;
        cards[user].monthlySpent += amount;
        
        totalSpending += amount;
        totalCashbackPaid += cashback;
        
        // Transfer to merchant if specified
        if (merchant != address(0)) {
            pmToken.safeTransfer(merchant, amount - cashback);
        }
        
        emit CardSpent(user, amount, cashback, merchant);
    }
    
    // ============ Withdrawal ============
    
    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        require(hasCard(msg.sender), "No card found");
        require(!cards[msg.sender].isFrozen, "Card is frozen");
        require(amount > 0, "Amount must be greater than 0");
        require(cards[msg.sender].balance >= amount, "Insufficient balance");
        
        cards[msg.sender].balance -= amount;
        pmToken.safeTransfer(msg.sender, amount);
        
        emit CardWithdraw(msg.sender, amount);
    }
    
    // ============ Tier Upgrade ============
    
    function upgradeTier(Tier newTier) external whenNotPaused {
        require(hasCard(msg.sender), "No card found");
        require(!cards[msg.sender].isFrozen, "Card is frozen");
        require(uint8(newTier) > uint8(cards[msg.sender].tier), "Can only upgrade to higher tier");
        require(tiers[newTier].isActive, "Tier not available");
        require(cards[msg.sender].totalDeposited >= tiers[newTier].minBalance, "Insufficient deposit history");
        
        Tier oldTier = cards[msg.sender].tier;
        cards[msg.sender].tier = newTier;
        
        emit TierUpgraded(msg.sender, oldTier, newTier);
    }
    
    function _checkAndUpgradeTier(address user) internal {
        Card storage card = cards[user];
        
        for (uint8 i = 5; i > uint8(card.tier); i--) {
            Tier checkTier = Tier(i);
            if (tiers[checkTier].isActive && card.totalDeposited >= tiers[checkTier].minBalance) {
                Tier oldTier = card.tier;
                card.tier = checkTier;
                emit TierUpgraded(user, oldTier, checkTier);
                break;
            }
        }
    }
    
    // ============ Admin Functions ============
    
    function setCardCreationFee(uint256 _fee) external onlyOwner {
        cardCreationFee = _fee;
    }
    
    function setTopUpFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        topUpFee = _fee;
    }
    
    function setTierInfo(
        Tier tier,
        uint256 minBalance,
        uint256 dailyLimit,
        uint256 monthlyLimit,
        uint256 cashbackRate
    ) external onlyOwner {
        require(cashbackRate <= 1000, "Cashback rate too high"); // Max 10%
        
        tiers[tier] = TierInfo({
            minBalance: minBalance,
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit,
            cashbackRate: cashbackRate,
            isActive: true
        });
        
        emit TierInfoUpdated(tier, minBalance, dailyLimit, monthlyLimit, cashbackRate);
    }
    
    function freezeCard(address user) external onlyOwner {
        require(hasCard(user), "No card found");
        cards[user].isFrozen = true;
        emit CardFrozen(user);
    }
    
    function unfreezeCard(address user) external onlyOwner {
        require(hasCard(user), "No card found");
        cards[user].isFrozen = false;
        emit CardUnfrozen(user);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 pmFees = accumulatedFees;
        uint256 bnbFees = accumulatedBNBFees;
        
        accumulatedFees = 0;
        accumulatedBNBFees = 0;
        
        if (pmFees > 0) {
            pmToken.safeTransfer(owner(), pmFees);
        }
        
        if (bnbFees > 0) {
            payable(owner()).transfer(bnbFees);
        }
        
        emit FeesWithdrawn(owner(), pmFees, bnbFees);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function hasCard(address user) public view returns (bool) {
        return cards[user].createdAt > 0;
    }
    
    function getCardInfo(address user) external view returns (Card memory) {
        return cards[user];
    }
    
    function getCardBalance(address user) external view returns (uint256) {
        return cards[user].balance;
    }
    
    function getCardNumber(address user) external view returns (string memory) {
        return cards[user].cardNumber;
    }
    
    function getUserTier(address user) external view returns (Tier) {
        return cards[user].tier;
    }
    
    function getTierInfo(Tier tier) external view returns (TierInfo memory) {
        return tiers[tier];
    }
    
    function getGlobalStats() external view returns (
        uint256 _totalCards,
        uint256 _totalDeposits,
        uint256 _topUpFee
    ) {
        return (totalCards, totalDeposits, topUpFee);
    }
    
    function getExtendedStats() external view returns (
        uint256 _totalCards,
        uint256 _totalDeposits,
        uint256 _totalSpending,
        uint256 _totalCashbackPaid,
        uint256 _accumulatedFees,
        uint256 _accumulatedBNBFees
    ) {
        return (totalCards, totalDeposits, totalSpending, totalCashbackPaid, accumulatedFees, accumulatedBNBFees);
    }
    
    function getCardHolders() external view returns (address[] memory) {
        return cardHolders;
    }
    
    function getCardHoldersCount() external view returns (uint256) {
        return cardHolders.length;
    }
    
    function getNextTierRequirement(address user) external view returns (
        Tier nextTier,
        uint256 requiredDeposit,
        uint256 currentDeposit,
        uint256 remaining
    ) {
        require(hasCard(user), "No card found");
        
        Tier current = cards[user].tier;
        if (uint8(current) >= 5) {
            return (Tier.Diamond, 0, cards[user].totalDeposited, 0);
        }
        
        nextTier = Tier(uint8(current) + 1);
        requiredDeposit = tiers[nextTier].minBalance;
        currentDeposit = cards[user].totalDeposited;
        remaining = requiredDeposit > currentDeposit ? requiredDeposit - currentDeposit : 0;
    }
    
    // ============ Internal Functions ============
    
    function _generateCardNumber(address user) internal pure returns (string memory) {
        bytes memory addr = abi.encodePacked(user);
        bytes memory result = new bytes(16);
        
        for (uint i = 0; i < 8; i++) {
            result[i] = _toHexChar(addr[i]);
        }
        for (uint i = 0; i < 8; i++) {
            result[i + 8] = _toHexChar(addr[12 + i]);
        }
        
        return string(result);
    }
    
    function _toHexChar(bytes1 b) internal pure returns (bytes1) {
        uint8 n = uint8(b) % 16;
        if (n < 10) return bytes1(n + 48); // 0-9
        return bytes1(n + 55); // A-F
    }
    
    function _resetLimitsIfNeeded(address user) internal {
        // Reset daily limit
        if (block.timestamp - cards[user].lastDailyReset >= 1 days) {
            cards[user].dailySpent = 0;
            cards[user].lastDailyReset = block.timestamp;
        }
        
        // Reset monthly limit
        if (block.timestamp - cards[user].lastMonthlyReset >= 30 days) {
            cards[user].monthlySpent = 0;
            cards[user].lastMonthlyReset = block.timestamp;
        }
    }
    
    // Receive BNB
    receive() external payable {
        accumulatedBNBFees += msg.value;
    }
}
