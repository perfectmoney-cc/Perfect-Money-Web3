// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PMVoucher
 * @dev Voucher system for PM Token ecosystem
 */
contract PMVoucher is Ownable, ReentrancyGuard, Pausable {
    IERC20 public pmToken;
    address public feeCollector;
    uint256 public merchantCreationFee = 10 * 10**18; // 10 PM tokens
    uint256 public nextVoucherId = 1;
    
    enum VoucherType { DISCOUNT, GIFT, REWARD }
    enum VoucherStatus { ACTIVE, USED, EXPIRED, CANCELLED }
    
    struct Voucher {
        uint256 id;
        address creator;
        address assignedTo;
        string code;
        string name;
        uint256 value;
        VoucherType voucherType;
        VoucherStatus status;
        uint256 createdAt;
        uint256 expiryDate;
        uint256 usedAt;
        bool isTransferable;
    }
    
    mapping(uint256 => Voucher) public vouchers;
    mapping(string => uint256) public codeToVoucherId;
    mapping(address => uint256[]) public userVouchers;
    mapping(address => uint256[]) public merchantCreatedVouchers;
    mapping(address => bool) public approvedMerchants;
    
    event VoucherCreated(
        uint256 indexed id,
        address indexed creator,
        string code,
        uint256 value,
        VoucherType voucherType,
        uint256 expiryDate
    );
    event VoucherRedeemed(uint256 indexed id, address indexed redeemedBy, uint256 value);
    event VoucherAssigned(uint256 indexed id, address indexed assignedTo);
    event VoucherTransferred(uint256 indexed id, address indexed from, address indexed to);
    event VoucherCancelled(uint256 indexed id);
    event MerchantApproved(address indexed merchant);
    event MerchantRevoked(address indexed merchant);
    event CreationFeeUpdated(uint256 newFee);
    
    constructor(address _pmToken, address _feeCollector) {
        pmToken = IERC20(_pmToken);
        feeCollector = _feeCollector;
    }
    
    modifier onlyMerchant() {
        require(approvedMerchants[msg.sender] || msg.sender == owner(), "Not an approved merchant");
        _;
    }
    
    function createVoucher(
        string memory _code,
        string memory _name,
        uint256 _value,
        VoucherType _voucherType,
        uint256 _expiryDate,
        bool _isTransferable
    ) external onlyMerchant whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_code).length > 0, "Code cannot be empty");
        require(codeToVoucherId[_code] == 0, "Code already exists");
        require(_expiryDate > block.timestamp, "Expiry must be in future");
        require(_value > 0, "Value must be positive");
        
        // Charge creation fee
        if (msg.sender != owner()) {
            require(pmToken.transferFrom(msg.sender, feeCollector, merchantCreationFee), "Fee transfer failed");
        }
        
        uint256 voucherId = nextVoucherId++;
        
        vouchers[voucherId] = Voucher({
            id: voucherId,
            creator: msg.sender,
            assignedTo: address(0),
            code: _code,
            name: _name,
            value: _value,
            voucherType: _voucherType,
            status: VoucherStatus.ACTIVE,
            createdAt: block.timestamp,
            expiryDate: _expiryDate,
            usedAt: 0,
            isTransferable: _isTransferable
        });
        
        codeToVoucherId[_code] = voucherId;
        merchantCreatedVouchers[msg.sender].push(voucherId);
        
        emit VoucherCreated(voucherId, msg.sender, _code, _value, _voucherType, _expiryDate);
        
        return voucherId;
    }
    
    function assignVoucher(uint256 _voucherId, address _to) external onlyMerchant {
        Voucher storage voucher = vouchers[_voucherId];
        require(voucher.id > 0, "Voucher does not exist");
        require(voucher.creator == msg.sender || msg.sender == owner(), "Not voucher creator");
        require(voucher.status == VoucherStatus.ACTIVE, "Voucher not active");
        require(voucher.assignedTo == address(0), "Already assigned");
        
        voucher.assignedTo = _to;
        userVouchers[_to].push(_voucherId);
        
        emit VoucherAssigned(_voucherId, _to);
    }
    
    function redeemVoucher(string memory _code) external nonReentrant whenNotPaused {
        uint256 voucherId = codeToVoucherId[_code];
        require(voucherId > 0, "Voucher not found");
        
        Voucher storage voucher = vouchers[voucherId];
        require(voucher.status == VoucherStatus.ACTIVE, "Voucher not active");
        require(block.timestamp <= voucher.expiryDate, "Voucher expired");
        require(
            voucher.assignedTo == address(0) || voucher.assignedTo == msg.sender,
            "Not assigned to you"
        );
        
        voucher.status = VoucherStatus.USED;
        voucher.usedAt = block.timestamp;
        
        // Transfer value to redeemer
        if (voucher.voucherType == VoucherType.GIFT || voucher.voucherType == VoucherType.REWARD) {
            require(pmToken.transfer(msg.sender, voucher.value), "Transfer failed");
        }
        
        if (voucher.assignedTo == address(0)) {
            voucher.assignedTo = msg.sender;
            userVouchers[msg.sender].push(voucherId);
        }
        
        emit VoucherRedeemed(voucherId, msg.sender, voucher.value);
    }
    
    function transferVoucher(uint256 _voucherId, address _to) external nonReentrant {
        Voucher storage voucher = vouchers[_voucherId];
        require(voucher.id > 0, "Voucher does not exist");
        require(voucher.assignedTo == msg.sender, "Not voucher owner");
        require(voucher.isTransferable, "Voucher not transferable");
        require(voucher.status == VoucherStatus.ACTIVE, "Voucher not active");
        require(_to != address(0) && _to != msg.sender, "Invalid recipient");
        
        voucher.assignedTo = _to;
        userVouchers[_to].push(_voucherId);
        
        emit VoucherTransferred(_voucherId, msg.sender, _to);
    }
    
    function cancelVoucher(uint256 _voucherId) external {
        Voucher storage voucher = vouchers[_voucherId];
        require(voucher.id > 0, "Voucher does not exist");
        require(voucher.creator == msg.sender || msg.sender == owner(), "Not authorized");
        require(voucher.status == VoucherStatus.ACTIVE, "Cannot cancel");
        
        voucher.status = VoucherStatus.CANCELLED;
        
        emit VoucherCancelled(_voucherId);
    }
    
    // View functions
    function getVoucherByCode(string memory _code) external view returns (Voucher memory) {
        uint256 voucherId = codeToVoucherId[_code];
        require(voucherId > 0, "Voucher not found");
        return vouchers[voucherId];
    }
    
    function isVoucherValid(string memory _code) external view returns (bool) {
        uint256 voucherId = codeToVoucherId[_code];
        if (voucherId == 0) return false;
        
        Voucher storage voucher = vouchers[voucherId];
        return voucher.status == VoucherStatus.ACTIVE && block.timestamp <= voucher.expiryDate;
    }
    
    function getUserVouchers(address _user) external view returns (uint256[] memory) {
        return userVouchers[_user];
    }
    
    function getMerchantVouchers(address _merchant) external view returns (uint256[] memory) {
        return merchantCreatedVouchers[_merchant];
    }
    
    // Admin functions
    function approveMerchant(address _merchant) external onlyOwner {
        approvedMerchants[_merchant] = true;
        emit MerchantApproved(_merchant);
    }
    
    function revokeMerchant(address _merchant) external onlyOwner {
        approvedMerchants[_merchant] = false;
        emit MerchantRevoked(_merchant);
    }
    
    function setCreationFee(uint256 _fee) external onlyOwner {
        merchantCreationFee = _fee;
        emit CreationFeeUpdated(_fee);
    }
    
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid address");
        feeCollector = _feeCollector;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    function withdrawTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
