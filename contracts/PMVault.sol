// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PMVault
 * @dev Staking vault with multiple lock periods and auto-compounding
 */
contract PMVault is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    
    // Lock periods in seconds
    uint256 public constant LOCK_30_DAYS = 30 days;
    uint256 public constant LOCK_90_DAYS = 90 days;
    uint256 public constant LOCK_180_DAYS = 180 days;
    uint256 public constant LOCK_365_DAYS = 365 days;
    
    // APY in basis points (100 = 1%)
    mapping(uint256 => uint256) public lockPeriodAPY;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 lastCompoundTime;
        uint256 accumulatedRewards;
        bool autoCompound;
    }
    
    mapping(address => Stake[]) public userStakes;
    
    // Global stats
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    uint256 public rewardsPool;
    
    // Early withdrawal penalty (in basis points)
    uint256 public earlyWithdrawalPenalty = 1000; // 10%
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 stakeIndex);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Compounded(address indexed user, uint256 amount);
    event RewardsPoolFunded(uint256 amount);
    
    constructor(address _pmToken) {
        require(_pmToken != address(0), "Invalid token");
        pmToken = IERC20(_pmToken);
        
        // Set default APYs
        lockPeriodAPY[LOCK_30_DAYS] = 500;   // 5%
        lockPeriodAPY[LOCK_90_DAYS] = 1200;  // 12%
        lockPeriodAPY[LOCK_180_DAYS] = 2000; // 20%
        lockPeriodAPY[LOCK_365_DAYS] = 3500; // 35%
    }
    
    // ============ Staking Functions ============
    
    function stake(uint256 amount, uint256 lockPeriod, bool autoCompound) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            lockPeriod == LOCK_30_DAYS ||
            lockPeriod == LOCK_90_DAYS ||
            lockPeriod == LOCK_180_DAYS ||
            lockPeriod == LOCK_365_DAYS,
            "Invalid lock period"
        );
        
        pmToken.safeTransferFrom(msg.sender, address(this), amount);
        
        userStakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            lastCompoundTime: block.timestamp,
            accumulatedRewards: 0,
            autoCompound: autoCompound
        }));
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, lockPeriod, userStakes[msg.sender].length - 1);
    }
    
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.amount > 0, "Already unstaked");
        
        uint256 amount = userStake.amount;
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        uint256 penalty = 0;
        
        // Check for early withdrawal
        bool isEarly = block.timestamp < userStake.startTime + userStake.lockPeriod;
        if (isEarly) {
            penalty = (amount * earlyWithdrawalPenalty) / 10000;
            rewards = 0; // No rewards for early withdrawal
        }
        
        uint256 totalPayout = amount - penalty + rewards;
        
        // Update state
        userStake.amount = 0;
        totalStaked -= amount;
        
        if (rewards > 0) {
            require(rewardsPool >= rewards, "Insufficient rewards pool");
            rewardsPool -= rewards;
            totalRewardsPaid += rewards;
        }
        
        // Transfer funds
        pmToken.safeTransfer(msg.sender, totalPayout);
        
        // Transfer penalty to rewards pool
        if (penalty > 0) {
            rewardsPool += penalty;
        }
        
        emit Unstaked(msg.sender, amount, rewards, penalty);
    }
    
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.amount > 0, "No active stake");
        require(!userStake.autoCompound, "Auto-compound enabled");
        
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        require(rewardsPool >= rewards, "Insufficient rewards pool");
        
        userStake.accumulatedRewards = 0;
        userStake.lastCompoundTime = block.timestamp;
        
        rewardsPool -= rewards;
        totalRewardsPaid += rewards;
        
        pmToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function compound(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.amount > 0, "No active stake");
        
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to compound");
        require(rewardsPool >= rewards, "Insufficient rewards pool");
        
        userStake.amount += rewards;
        userStake.accumulatedRewards = 0;
        userStake.lastCompoundTime = block.timestamp;
        
        rewardsPool -= rewards;
        totalStaked += rewards;
        
        emit Compounded(msg.sender, rewards);
    }
    
    // ============ View Functions ============
    
    function calculateRewards(address user, uint256 stakeIndex) public view returns (uint256) {
        if (stakeIndex >= userStakes[user].length) return 0;
        
        Stake memory userStake = userStakes[user][stakeIndex];
        if (userStake.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - userStake.lastCompoundTime;
        uint256 apy = lockPeriodAPY[userStake.lockPeriod];
        
        // Calculate rewards: principal * APY * timeElapsed / (365 days * 10000)
        uint256 rewards = (userStake.amount * apy * timeElapsed) / (365 days * 10000);
        
        return rewards + userStake.accumulatedRewards;
    }
    
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }
    
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }
    
    function getTotalUserStaked(address user) external view returns (uint256) {
        uint256 total;
        for (uint i = 0; i < userStakes[user].length; i++) {
            total += userStakes[user][i].amount;
        }
        return total;
    }
    
    function getTotalUserRewards(address user) external view returns (uint256) {
        uint256 total;
        for (uint i = 0; i < userStakes[user].length; i++) {
            total += calculateRewards(user, i);
        }
        return total;
    }
    
    function getVaultStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsPaid,
        uint256 _rewardsPool
    ) {
        return (totalStaked, totalRewardsPaid, rewardsPool);
    }
    
    // ============ Admin Functions ============
    
    function fundRewardsPool(uint256 amount) external onlyOwner {
        pmToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardsPool += amount;
        emit RewardsPoolFunded(amount);
    }
    
    function setAPY(uint256 lockPeriod, uint256 apy) external onlyOwner {
        require(apy <= 10000, "APY too high"); // Max 100%
        lockPeriodAPY[lockPeriod] = apy;
    }
    
    function setEarlyWithdrawalPenalty(uint256 penalty) external onlyOwner {
        require(penalty <= 5000, "Penalty too high"); // Max 50%
        earlyWithdrawalPenalty = penalty;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = pmToken.balanceOf(address(this)) - totalStaked;
        if (balance > 0) {
            pmToken.safeTransfer(owner(), balance);
        }
    }
}
