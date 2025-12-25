// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PMPartnership
 * @dev Partnership management contract for Perfect Money ecosystem
 */
contract PMPartnership is Ownable, Pausable, ReentrancyGuard {
    IERC20 public pmToken;

    enum PartnerTier { Bronze, Silver, Gold, Platinum }
    enum ApplicationStatus { Pending, Approved, Rejected }

    struct Partner {
        address wallet;
        string name;
        string partnerType;
        string country;
        string city;
        int256 latitude;  // Stored as lat * 1e6 for precision
        int256 longitude; // Stored as lng * 1e6 for precision
        PartnerTier tier;
        bool isActive;
        uint256 totalRevenue;
        uint256 joinedAt;
        uint256 lastPayout;
    }

    struct Application {
        address applicant;
        string name;
        string email;
        string partnerType;
        string country;
        ApplicationStatus status;
        uint256 appliedAt;
        string rejectionReason;
    }

    struct TierInfo {
        uint256 revenueShare;      // in basis points (e.g., 500 = 5%)
        uint256 minMonthlyVolume;  // minimum volume required
        bool isActive;
    }

    // Mappings
    mapping(address => Partner) public partners;
    mapping(uint256 => Application) public applications;
    mapping(PartnerTier => TierInfo) public tiers;
    
    address[] public partnerAddresses;
    uint256 public applicationCount;
    
    // Settings
    uint256 public minPayout = 100 * 10**18; // 100 PM tokens
    uint256 public applicationFee = 0.01 ether;
    
    // Stats
    uint256 public totalPartners;
    uint256 public activePartners;
    uint256 public totalRevenuePaid;
    uint256 public pendingApplications;

    // Events
    event PartnerAdded(address indexed wallet, string name, PartnerTier tier);
    event PartnerUpdated(address indexed wallet, bool isActive);
    event PartnerTierChanged(address indexed wallet, PartnerTier oldTier, PartnerTier newTier);
    event ApplicationSubmitted(uint256 indexed applicationId, address indexed applicant, string name);
    event ApplicationApproved(uint256 indexed applicationId, address indexed partner);
    event ApplicationRejected(uint256 indexed applicationId, string reason);
    event RevenuePaid(address indexed partner, uint256 amount);
    event TierUpdated(PartnerTier tier, uint256 revenueShare, uint256 minVolume);

    constructor(address _pmToken) Ownable(msg.sender) {
        pmToken = IERC20(_pmToken);
        
        // Initialize tier settings
        tiers[PartnerTier.Bronze] = TierInfo(500, 1000 * 10**18, true);    // 5%
        tiers[PartnerTier.Silver] = TierInfo(1000, 5000 * 10**18, true);   // 10%
        tiers[PartnerTier.Gold] = TierInfo(1500, 20000 * 10**18, true);    // 15%
        tiers[PartnerTier.Platinum] = TierInfo(2000, 100000 * 10**18, true); // 20%
    }

    // ============ Partner Management ============

    function addPartner(
        address _wallet,
        string memory _name,
        string memory _partnerType,
        string memory _country,
        string memory _city,
        int256 _latitude,
        int256 _longitude,
        PartnerTier _tier
    ) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        require(!partners[_wallet].isActive, "Partner already exists");

        partners[_wallet] = Partner({
            wallet: _wallet,
            name: _name,
            partnerType: _partnerType,
            country: _country,
            city: _city,
            latitude: _latitude,
            longitude: _longitude,
            tier: _tier,
            isActive: true,
            totalRevenue: 0,
            joinedAt: block.timestamp,
            lastPayout: 0
        });

        partnerAddresses.push(_wallet);
        totalPartners++;
        activePartners++;

        emit PartnerAdded(_wallet, _name, _tier);
    }

    function updatePartnerStatus(address _wallet, bool _isActive) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        
        if (partners[_wallet].isActive && !_isActive) {
            activePartners--;
        } else if (!partners[_wallet].isActive && _isActive) {
            activePartners++;
        }
        
        partners[_wallet].isActive = _isActive;
        emit PartnerUpdated(_wallet, _isActive);
    }

    function upgradePartnerTier(address _wallet, PartnerTier _newTier) external onlyOwner {
        require(partners[_wallet].wallet != address(0), "Partner does not exist");
        require(tiers[_newTier].isActive, "Tier is not active");

        PartnerTier oldTier = partners[_wallet].tier;
        partners[_wallet].tier = _newTier;

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
    }

    // ============ Application Management ============

    function submitApplication(
        string memory _name,
        string memory _email,
        string memory _partnerType,
        string memory _country
    ) external payable whenNotPaused {
        require(msg.value >= applicationFee, "Insufficient application fee");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_email).length > 0, "Email required");

        applicationCount++;
        applications[applicationCount] = Application({
            applicant: msg.sender,
            name: _name,
            email: _email,
            partnerType: _partnerType,
            country: _country,
            status: ApplicationStatus.Pending,
            appliedAt: block.timestamp,
            rejectionReason: ""
        });

        pendingApplications++;
        emit ApplicationSubmitted(applicationCount, msg.sender, _name);
    }

    function approveApplication(uint256 _applicationId) external onlyOwner {
        Application storage app = applications[_applicationId];
        require(app.status == ApplicationStatus.Pending, "Application not pending");

        app.status = ApplicationStatus.Approved;
        pendingApplications--;

        // Add as partner with Bronze tier
        partners[app.applicant] = Partner({
            wallet: app.applicant,
            name: app.name,
            partnerType: app.partnerType,
            country: app.country,
            city: "",
            latitude: 0,
            longitude: 0,
            tier: PartnerTier.Bronze,
            isActive: true,
            totalRevenue: 0,
            joinedAt: block.timestamp,
            lastPayout: 0
        });

        partnerAddresses.push(app.applicant);
        totalPartners++;
        activePartners++;

        emit ApplicationApproved(_applicationId, app.applicant);
        emit PartnerAdded(app.applicant, app.name, PartnerTier.Bronze);
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
        require(partners[_partner].isActive, "Partner not active");
        partners[_partner].totalRevenue += _amount;
    }

    function payoutRevenue(address _partner) external onlyOwner nonReentrant {
        Partner storage partner = partners[_partner];
        require(partner.isActive, "Partner not active");
        
        TierInfo memory tierInfo = tiers[partner.tier];
        uint256 pendingAmount = (partner.totalRevenue * tierInfo.revenueShare) / 10000;
        
        require(pendingAmount >= minPayout, "Below minimum payout");
        require(pmToken.balanceOf(address(this)) >= pendingAmount, "Insufficient contract balance");

        partner.lastPayout = block.timestamp;
        totalRevenuePaid += pendingAmount;
        partner.totalRevenue = 0;

        pmToken.transfer(_partner, pendingAmount);
        emit RevenuePaid(_partner, pendingAmount);
    }

    // ============ Admin Functions ============

    function setTierInfo(
        PartnerTier _tier,
        uint256 _revenueShare,
        uint256 _minVolume,
        bool _isActive
    ) external onlyOwner {
        require(_revenueShare <= 5000, "Revenue share too high"); // Max 50%
        
        tiers[_tier] = TierInfo(_revenueShare, _minVolume, _isActive);
        emit TierUpdated(_tier, _revenueShare, _minVolume);
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

    function getPartnerCount() external view returns (uint256 total, uint256 active) {
        return (totalPartners, activePartners);
    }

    function getAllPartners() external view returns (address[] memory) {
        return partnerAddresses;
    }

    function getGlobalStats() external view returns (
        uint256 _totalPartners,
        uint256 _activePartners,
        uint256 _pendingApplications,
        uint256 _totalRevenuePaid
    ) {
        return (totalPartners, activePartners, pendingApplications, totalRevenuePaid);
    }

    function isPartner(address _wallet) external view returns (bool) {
        return partners[_wallet].isActive;
    }

    receive() external payable {}
}
