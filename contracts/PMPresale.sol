// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PMPresale
 * @dev Presale contract for PM Token with multiple payment options
 */
contract PMPresale is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    IERC20 public immutable usdt;
    IERC20 public immutable usdc;
    
    // Presale settings
    uint256 public tokenPrice; // Price per token in USD (18 decimals)
    uint256 public minPurchase;
    uint256 public maxPurchase;
    uint256 public hardCap;
    uint256 public softCap;
    uint256 public totalRaised;
    uint256 public totalTokensSold;
    
    // Timing
    uint256 public startTime;
    uint256 public endTime;
    bool public presaleActive;
    
    // Vesting
    uint256 public vestingStart;
    uint256 public vestingDuration;
    uint256 public tgePercentage; // Token Generation Event unlock %
    
    // Participant tracking
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokensPurchased;
    mapping(address => uint256) public tokensClaimed;
    address[] public participants;
    
    // Referral system
    mapping(address => address) public referrer;
    mapping(address => uint256) public referralEarnings;
    uint256 public referralBonus = 500; // 5% in basis points
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 usdAmount, uint256 tokenAmount, address indexed referrer);
    event TokensClaimed(address indexed user, uint256 amount);
    event PresaleStarted(uint256 startTime, uint256 endTime);
    event PresaleEnded(uint256 totalRaised, uint256 totalTokensSold);
    event ReferralPaid(address indexed referrer, address indexed buyer, uint256 amount);
    
    constructor(
        address _pmToken,
        address _usdt,
        address _usdc,
        uint256 _tokenPrice,
        uint256 _minPurchase,
        uint256 _maxPurchase,
        uint256 _softCap,
        uint256 _hardCap
    ) {
        require(_pmToken != address(0), "Invalid token");
        require(_usdt != address(0), "Invalid USDT");
        require(_usdc != address(0), "Invalid USDC");
        
        pmToken = IERC20(_pmToken);
        usdt = IERC20(_usdt);
        usdc = IERC20(_usdc);
        
        tokenPrice = _tokenPrice;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        softCap = _softCap;
        hardCap = _hardCap;
        
        tgePercentage = 2500; // 25% at TGE
        vestingDuration = 180 days;
    }
    
    // ============ Purchase Functions ============
    
    function buyWithBNB(address _referrer) external payable whenNotPaused nonReentrant {
        require(presaleActive, "Presale not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale not in progress");
        require(msg.value > 0, "Must send BNB");
        
        // Convert BNB to USD value (would use oracle in production)
        uint256 usdValue = msg.value; // Simplified - use Chainlink in production
        
        _processPurchase(msg.sender, usdValue, _referrer);
    }
    
    function buyWithUSDT(uint256 amount, address _referrer) external whenNotPaused nonReentrant {
        require(presaleActive, "Presale not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale not in progress");
        require(amount > 0, "Amount must be > 0");
        
        usdt.safeTransferFrom(msg.sender, address(this), amount);
        _processPurchase(msg.sender, amount, _referrer);
    }
    
    function buyWithUSDC(uint256 amount, address _referrer) external whenNotPaused nonReentrant {
        require(presaleActive, "Presale not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale not in progress");
        require(amount > 0, "Amount must be > 0");
        
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        _processPurchase(msg.sender, amount, _referrer);
    }
    
    function _processPurchase(address buyer, uint256 usdAmount, address _referrer) internal {
        require(usdAmount >= minPurchase, "Below minimum purchase");
        require(contributions[buyer] + usdAmount <= maxPurchase, "Exceeds max purchase");
        require(totalRaised + usdAmount <= hardCap, "Hard cap reached");
        
        uint256 tokenAmount = (usdAmount * 1e18) / tokenPrice;
        
        // Track new participant
        if (contributions[buyer] == 0) {
            participants.push(buyer);
        }
        
        contributions[buyer] += usdAmount;
        tokensPurchased[buyer] += tokenAmount;
        totalRaised += usdAmount;
        totalTokensSold += tokenAmount;
        
        // Handle referral
        if (_referrer != address(0) && _referrer != buyer && referrer[buyer] == address(0)) {
            referrer[buyer] = _referrer;
            uint256 referralReward = (tokenAmount * referralBonus) / 10000;
            tokensPurchased[_referrer] += referralReward;
            referralEarnings[_referrer] += referralReward;
            totalTokensSold += referralReward;
            emit ReferralPaid(_referrer, buyer, referralReward);
        }
        
        emit TokensPurchased(buyer, usdAmount, tokenAmount, _referrer);
    }
    
    // ============ Claim Functions ============
    
    function claimTokens() external nonReentrant {
        require(vestingStart > 0, "Vesting not started");
        
        uint256 claimable = getClaimableAmount(msg.sender);
        require(claimable > 0, "Nothing to claim");
        
        tokensClaimed[msg.sender] += claimable;
        pmToken.safeTransfer(msg.sender, claimable);
        
        emit TokensClaimed(msg.sender, claimable);
    }
    
    function getClaimableAmount(address user) public view returns (uint256) {
        if (vestingStart == 0 || tokensPurchased[user] == 0) return 0;
        
        uint256 totalTokens = tokensPurchased[user];
        uint256 tgeAmount = (totalTokens * tgePercentage) / 10000;
        uint256 vestedAmount = totalTokens - tgeAmount;
        
        uint256 unlocked;
        if (block.timestamp < vestingStart) {
            unlocked = 0;
        } else if (block.timestamp >= vestingStart + vestingDuration) {
            unlocked = totalTokens;
        } else {
            uint256 elapsed = block.timestamp - vestingStart;
            uint256 vestedPortion = (vestedAmount * elapsed) / vestingDuration;
            unlocked = tgeAmount + vestedPortion;
        }
        
        return unlocked > tokensClaimed[user] ? unlocked - tokensClaimed[user] : 0;
    }
    
    // ============ Admin Functions ============
    
    function startPresale(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(!presaleActive, "Already started");
        require(_startTime >= block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");
        
        startTime = _startTime;
        endTime = _endTime;
        presaleActive = true;
        
        emit PresaleStarted(_startTime, _endTime);
    }
    
    function endPresale() external onlyOwner {
        require(presaleActive, "Not active");
        presaleActive = false;
        emit PresaleEnded(totalRaised, totalTokensSold);
    }
    
    function startVesting() external onlyOwner {
        require(!presaleActive, "Presale still active");
        require(vestingStart == 0, "Vesting already started");
        vestingStart = block.timestamp;
    }
    
    function setTokenPrice(uint256 _price) external onlyOwner {
        require(!presaleActive, "Cannot change during presale");
        tokenPrice = _price;
    }
    
    function setReferralBonus(uint256 _bonus) external onlyOwner {
        require(_bonus <= 2000, "Max 20%");
        referralBonus = _bonus;
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 bnbBalance = address(this).balance;
        if (bnbBalance > 0) {
            payable(owner()).transfer(bnbBalance);
        }
        
        uint256 usdtBalance = usdt.balanceOf(address(this));
        if (usdtBalance > 0) {
            usdt.safeTransfer(owner(), usdtBalance);
        }
        
        uint256 usdcBalance = usdc.balanceOf(address(this));
        if (usdcBalance > 0) {
            usdc.safeTransfer(owner(), usdcBalance);
        }
    }
    
    function withdrawUnsoldTokens() external onlyOwner {
        require(!presaleActive, "Presale active");
        uint256 unsold = pmToken.balanceOf(address(this)) - (totalTokensSold - getTotalClaimed());
        if (unsold > 0) {
            pmToken.safeTransfer(owner(), unsold);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getParticipantsCount() external view returns (uint256) {
        return participants.length;
    }
    
    function getTotalClaimed() public view returns (uint256) {
        uint256 total;
        for (uint i = 0; i < participants.length; i++) {
            total += tokensClaimed[participants[i]];
        }
        return total;
    }
    
    function getPresaleInfo() external view returns (
        uint256 _tokenPrice,
        uint256 _totalRaised,
        uint256 _totalTokensSold,
        uint256 _softCap,
        uint256 _hardCap,
        bool _isActive
    ) {
        return (tokenPrice, totalRaised, totalTokensSold, softCap, hardCap, presaleActive);
    }
    
    receive() external payable {}
}
