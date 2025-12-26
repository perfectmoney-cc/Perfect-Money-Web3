// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PMPartnership
 * @dev Global Exchanger Network partnership management for Perfect Money ecosystem
 * @notice Manages partner registration, tiers, revenue sharing, and location data
 */
contract PMPartnership is Ownable, Pausable, ReentrancyGuard {
    IERC20 public pmToken;

    enum PartnerTier { Bronze, Silver, Gold, Platinum }
    enum ApplicationStatus { Pending, Approved, Rejected }
    enum PartnerStatus { Active, Pending, Inactive }

    struct Partner {
        address wallet;
        string name;
        string partnerType;
        string country;
        string city;
        string email;
        int256 latitude;  // Stored as lat * 1e6 for precision
        int256 longitude; // Stored as lng * 1e6 for precision
        PartnerTier tier;
        PartnerStatus status;
        uint256 totalRevenue;
        uint256 pendingRevenue;
        uint256 totalPayout;
        uint256 joinedAt;
        uint256 lastPayout;
        uint256 transactionCount;
        string description;
    }

    struct Application {
        address applicant;
        string name;
        string email;
        string partnerType;
        string country;
        string city;
        int256 latitude;
        int256 longitude;
        PartnerTier requestedTier;
        uint256 stakingAmount;
        ApplicationStatus status;
        uint256 appliedAt;
        string rejectionReason;
        string description;
    }

    struct TierInfo {
        uint256 revenueShare;      // in basis points (e.g., 500 = 5%)
        uint256 minStakingAmount;  // minimum PM tokens to stake
        uint256 minMonthlyVolume;  // minimum volume required
        bool isActive;
    }

    struct PartnerEvent {
        address partner;
        string eventType; // "joined", "tier_upgrade", "status_change"
        uint256 timestamp;
        string details;
    }

    // Mappings
    mapping(address => Partner) public partners;
    mapping(uint256 => Application) public applications;
    mapping(PartnerTier => TierInfo) public tiers;
    mapping(address => uint256) public stakedTokens;
    
    address[] public partnerAddresses;
    uint256 public applicationCount;
    PartnerEvent[] public partnerEvents;
    
    // Settings
    uint256 public minPayout = 100 * 10**18; // 100 PM tokens
    uint256 public applicationFee = 0.01 ether;
    uint256 public maxEventsStored = 100;
    
    // Stats
    uint256 public totalPartners;
    uint256 public activePartners;
    uint256 public pendingPartners;
    uint256 public inactivePartners;
    uint256 public totalRevenuePaid;
    uint256 public pendingApplications;
    uint256 public totalTransactions;

    // Events
    event PartnerAdded(address indexed wallet, string name, PartnerTier tier, string country, string city);
    event PartnerStatusChanged(address indexed wallet, PartnerStatus oldStatus, PartnerStatus newStatus);
    event PartnerTierChanged(address indexed wallet, PartnerTier oldTier, PartnerTier newTier);
    event PartnerLocationUpdated(address indexed wallet, string city, int256 latitude, int256 longitude);
    event ApplicationSubmitted(uint256 indexed applicationId, address indexed applicant, string name, PartnerTier requestedTier);
    event ApplicationApproved(uint256 indexed applicationId, address indexed partner, string email);
    event ApplicationRejected(uint256 indexed applicationId, string reason);
    event RevenuePaid(address indexed partner, uint256 amount);
    event RevenueRecorded(address indexed partner, uint256 amount);
    event TokensStaked(address indexed partner, uint256 amount);
    event TokensUnstaked(address indexed partner, uint256 amount);
    event TierUpdated(PartnerTier tier, uint256 revenueShare, uint256 minStaking, uint256 minVolume);

    constructor(address _pmToken) Ownable(msg.sender) {
        pmToken = IERC20(_pmToken);
        
        // Initialize tier settings with staking requirements
        tiers[PartnerTier.Bronze] = TierInfo(500, 1000 * 10**18, 1000 * 10**18, true);      // 5%, 1k PM stake
        tiers[PartnerTier.Silver] = TierInfo(1000, 5000 * 10**18, 5000 * 10**18, true);     // 10%, 5k PM stake
        tiers[PartnerTier.Gold] = TierInfo(1500, 25000 * 10**18, 20000 * 10**18, true);     // 15%, 25k PM stake
        tiers[PartnerTier.Platinum] = TierInfo(2000, 100000 * 10**18, 100000 * 10**18, true); // 20%, 100k PM stake
    }

    // ============ Partner Management ============

    function addPartner(
        address _wallet,
        string memory _name,
        string memory _partnerType,
        string memory _country,
        string memory _city,
        string memory _email,
        int256 _latitude,
        int256 _longitude,
        PartnerTier _tier,
        string memory _description
    ) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        require(partners[_wallet].wallet == address(0), "Partner already exists");

        partners[_wallet] = Partner({
            wallet: _wallet,
            name: _name,
            partnerType: _partnerType,
            country: _country,
            city: _city,
            email: _email,
            latitude: _latitude,
            longitude: _longitude,
            tier: _tier,
            status: PartnerStatus.Active,
            totalRevenue: 0,
            pendingRevenue: 0,
            totalPayout: 0,
            joinedAt: block.timestamp,
            lastPayout: 0,
            transactionCount: 0,
            description: _description
        });

        partnerAddresses.push(_wallet);
        totalPartners++;
        activePartners++;

        _addPartnerEvent(_wallet, "joined", string(abi.encodePacked(_name, " joined as ", _tierToString(_tier))));
        emit PartnerAdded(_wallet, _name, _tier, _country, _city);
    }

    function updatePartnerStatus(address _wallet, PartnerStatus _newStatus) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        
        PartnerStatus oldStatus = partners[_wallet].status;
        
        // Update counters
        if (oldStatus == PartnerStatus.Active) activePartners--;
        else if (oldStatus == PartnerStatus.Pending) pendingPartners--;
        else if (oldStatus == PartnerStatus.Inactive) inactivePartners--;
        
        if (_newStatus == PartnerStatus.Active) activePartners++;
        else if (_newStatus == PartnerStatus.Pending) pendingPartners++;
        else if (_newStatus == PartnerStatus.Inactive) inactivePartners++;
        
        partners[_wallet].status = _newStatus;
        
        _addPartnerEvent(_wallet, "status_change", string(abi.encodePacked(
            partners[_wallet].name, " status changed to ", _statusToString(_newStatus)
        )));
        
        emit PartnerStatusChanged(_wallet, oldStatus, _newStatus);
    }

    function upgradePartnerTier(address _wallet, PartnerTier _newTier) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        require(tiers[_newTier].isActive, "Tier is not active");
        require(stakedTokens[_wallet] >= tiers[_newTier].minStakingAmount, "Insufficient staked tokens for tier");

        PartnerTier oldTier = partners[_wallet].tier;
        partners[_wallet].tier = _newTier;

        _addPartnerEvent(_wallet, "tier_upgrade", string(abi.encodePacked(
            partners[_wallet].name, " upgraded from ", _tierToString(oldTier), " to ", _tierToString(_newTier)
        )));

        emit PartnerTierChanged(_wallet, oldTier, _newTier);
    }

    function updatePartnerLocation(
        address _wallet,
        string memory _city,
        int256 _latitude,
        int256 _longitude
    ) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        
        partners[_wallet].city = _city;
        partners[_wallet].latitude = _latitude;
        partners[_wallet].longitude = _longitude;
        
        emit PartnerLocationUpdated(_wallet, _city, _latitude, _longitude);
    }

    function updatePartnerInfo(
        address _wallet,
        string memory _name,
        string memory _email,
        string memory _description
    ) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        
        partners[_wallet].name = _name;
        partners[_wallet].email = _email;
        partners[_wallet].description = _description;
    }

    // ============ Staking ============

    function stakeTokens(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(pmToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        stakedTokens[msg.sender] += _amount;
        emit TokensStaked(msg.sender, _amount);
    }

    function unstakeTokens(uint256 _amount) external nonReentrant {
        require(stakedTokens[msg.sender] >= _amount, "Insufficient staked balance");
        
        // Check if unstaking would drop below tier requirement
        if (partners[msg.sender].wallet != address(0)) {
            PartnerTier currentTier = partners[msg.sender].tier;
            uint256 remainingStake = stakedTokens[msg.sender] - _amount;
            require(remainingStake >= tiers[currentTier].minStakingAmount, "Cannot unstake below tier requirement");
        }
        
        stakedTokens[msg.sender] -= _amount;
        require(pmToken.transfer(msg.sender, _amount), "Token transfer failed");
        
        emit TokensUnstaked(msg.sender, _amount);
    }

    // ============ Application Management ============

    function submitApplication(
        string memory _name,
        string memory _email,
        string memory _partnerType,
        string memory _country,
        string memory _city,
        int256 _latitude,
        int256 _longitude,
        PartnerTier _requestedTier,
        string memory _description
    ) external payable whenNotPaused {
        require(msg.value >= applicationFee, "Insufficient application fee");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_email).length > 0, "Email required");
        require(partners[msg.sender].wallet == address(0), "Already a partner");
        require(stakedTokens[msg.sender] >= tiers[_requestedTier].minStakingAmount, "Insufficient staked tokens for tier");

        applicationCount++;
        applications[applicationCount] = Application({
            applicant: msg.sender,
            name: _name,
            email: _email,
            partnerType: _partnerType,
            country: _country,
            city: _city,
            latitude: _latitude,
            longitude: _longitude,
            requestedTier: _requestedTier,
            stakingAmount: stakedTokens[msg.sender],
            status: ApplicationStatus.Pending,
            appliedAt: block.timestamp,
            rejectionReason: "",
            description: _description
        });

        pendingApplications++;
        emit ApplicationSubmitted(applicationCount, msg.sender, _name, _requestedTier);
    }

    function approveApplication(uint256 _applicationId) external onlyOwner {
        Application storage app = applications[_applicationId];
        require(app.status == ApplicationStatus.Pending, "Application not pending");

        app.status = ApplicationStatus.Approved;
        pendingApplications--;

        partners[app.applicant] = Partner({
            wallet: app.applicant,
            name: app.name,
            partnerType: app.partnerType,
            country: app.country,
            city: app.city,
            email: app.email,
            latitude: app.latitude,
            longitude: app.longitude,
            tier: app.requestedTier,
            status: PartnerStatus.Active,
            totalRevenue: 0,
            pendingRevenue: 0,
            totalPayout: 0,
            joinedAt: block.timestamp,
            lastPayout: 0,
            transactionCount: 0,
            description: app.description
        });

        partnerAddresses.push(app.applicant);
        totalPartners++;
        activePartners++;

        _addPartnerEvent(app.applicant, "joined", string(abi.encodePacked(app.name, " joined as ", _tierToString(app.requestedTier))));

        emit ApplicationApproved(_applicationId, app.applicant, app.email);
        emit PartnerAdded(app.applicant, app.name, app.requestedTier, app.country, app.city);
    }

    function rejectApplication(uint256 _applicationId, string memory _reason) external onlyOwner {
        Application storage app = applications[_applicationId];
        require(app.status == ApplicationStatus.Pending, "Application not pending");

        app.status = ApplicationStatus.Rejected;
        app.rejectionReason = _reason;
        pendingApplications--;

        emit ApplicationRejected(_applicationId, _reason);
    }

    // ============ Revenue Distribution ============

    function recordRevenue(address _partner, uint256 _amount) external onlyOwner {
        require(partners[_partner].status == PartnerStatus.Active, "Partner not active");
        partners[_partner].totalRevenue += _amount;
        partners[_partner].pendingRevenue += _amount;
        partners[_partner].transactionCount++;
        totalTransactions++;
        
        emit RevenueRecorded(_partner, _amount);
    }

    function payoutRevenue(address _partner) external onlyOwner nonReentrant {
        Partner storage partner = partners[_partner];
        require(partner.status == PartnerStatus.Active, "Partner not active");
        
        TierInfo memory tierInfo = tiers[partner.tier];
        uint256 pendingAmount = (partner.pendingRevenue * tierInfo.revenueShare) / 10000;
        
        require(pendingAmount >= minPayout, "Below minimum payout");
        require(pmToken.balanceOf(address(this)) >= pendingAmount, "Insufficient contract balance");

        partner.lastPayout = block.timestamp;
        partner.totalPayout += pendingAmount;
        partner.pendingRevenue = 0;
        totalRevenuePaid += pendingAmount;

        pmToken.transfer(_partner, pendingAmount);
        emit RevenuePaid(_partner, pendingAmount);
    }

    // ============ Admin Functions ============

    function setTierInfo(
        PartnerTier _tier,
        uint256 _revenueShare,
        uint256 _minStaking,
        uint256 _minVolume,
        bool _isActive
    ) external onlyOwner {
        require(_revenueShare <= 5000, "Revenue share too high"); // Max 50%
        
        tiers[_tier] = TierInfo(_revenueShare, _minStaking, _minVolume, _isActive);
        emit TierUpdated(_tier, _revenueShare, _minStaking, _minVolume);
    }

    function setMinPayout(uint256 _minPayout) external onlyOwner {
        minPayout = _minPayout;
    }

    function setApplicationFee(uint256 _fee) external onlyOwner {
        applicationFee = _fee;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(pmToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        pmToken.transfer(owner(), _amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Internal Functions ============

    function _addPartnerEvent(address _partner, string memory _eventType, string memory _details) internal {
        if (partnerEvents.length >= maxEventsStored) {
            // Remove oldest event
            for (uint i = 0; i < partnerEvents.length - 1; i++) {
                partnerEvents[i] = partnerEvents[i + 1];
            }
            partnerEvents.pop();
        }
        
        partnerEvents.push(PartnerEvent({
            partner: _partner,
            eventType: _eventType,
            timestamp: block.timestamp,
            details: _details
        }));
    }

    function _tierToString(PartnerTier _tier) internal pure returns (string memory) {
        if (_tier == PartnerTier.Bronze) return "Bronze";
        if (_tier == PartnerTier.Silver) return "Silver";
        if (_tier == PartnerTier.Gold) return "Gold";
        return "Platinum";
    }

    function _statusToString(PartnerStatus _status) internal pure returns (string memory) {
        if (_status == PartnerStatus.Active) return "Active";
        if (_status == PartnerStatus.Pending) return "Pending";
        return "Inactive";
    }

    // ============ View Functions ============

    function getPartner(address _wallet) external view returns (Partner memory) {
        return partners[_wallet];
    }

    function getApplication(uint256 _applicationId) external view returns (Application memory) {
        return applications[_applicationId];
    }

    function getTierInfo(PartnerTier _tier) external view returns (TierInfo memory) {
        return tiers[_tier];
    }

    function getPartnerCount() external view returns (uint256 total, uint256 active, uint256 pending, uint256 inactive) {
        return (totalPartners, activePartners, pendingPartners, inactivePartners);
    }

    function getAllPartners() external view returns (address[] memory) {
        return partnerAddresses;
    }

    function getGlobalStats() external view returns (
        uint256 _totalPartners,
        uint256 _activePartners,
        uint256 _pendingApplications,
        uint256 _totalRevenuePaid,
        uint256 _totalTransactions
    ) {
        return (totalPartners, activePartners, pendingApplications, totalRevenuePaid, totalTransactions);
    }

    function getRecentEvents(uint256 _count) external view returns (PartnerEvent[] memory) {
        uint256 count = _count > partnerEvents.length ? partnerEvents.length : _count;
        PartnerEvent[] memory events = new PartnerEvent[](count);
        
        for (uint256 i = 0; i < count; i++) {
            events[i] = partnerEvents[partnerEvents.length - count + i];
        }
        
        return events;
    }

    function getPartnersByCountry(string memory _country) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < partnerAddresses.length; i++) {
            if (keccak256(bytes(partners[partnerAddresses[i]].country)) == keccak256(bytes(_country))) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < partnerAddresses.length; i++) {
            if (keccak256(bytes(partners[partnerAddresses[i]].country)) == keccak256(bytes(_country))) {
                result[index] = partnerAddresses[i];
                index++;
            }
        }
        
        return result;
    }

    function getPartnersByStatus(PartnerStatus _status) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < partnerAddresses.length; i++) {
            if (partners[partnerAddresses[i]].status == _status) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < partnerAddresses.length; i++) {
            if (partners[partnerAddresses[i]].status == _status) {
                result[index] = partnerAddresses[i];
                index++;
            }
        }
        
        return result;
    }

    function isPartner(address _wallet) external view returns (bool) {
        return partners[_wallet].wallet != address(0);
    }

    function getStakedBalance(address _wallet) external view returns (uint256) {
        return stakedTokens[_wallet];
    }

    receive() external payable {}
}