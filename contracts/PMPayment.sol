// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PMPayment
 * @dev Payment link system for merchants to create and manage payment requests
 */
contract PMPayment is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    
    struct PaymentLink {
        address merchant;
        uint256 amount;
        string description;
        uint256 expiryTime;
        bool isPaid;
        bool isCancelled;
        address paidBy;
        uint256 paidAt;
    }
    
    mapping(bytes32 => PaymentLink) public paymentLinks;
    mapping(address => bytes32[]) public merchantLinks;
    
    // Fee settings
    uint256 public platformFee = 100; // 1% in basis points
    uint256 public accumulatedFees;
    
    // Events
    event PaymentLinkCreated(bytes32 indexed linkId, address indexed merchant, uint256 amount, uint256 expiryTime);
    event PaymentCompleted(bytes32 indexed linkId, address indexed payer, uint256 amount, uint256 fee);
    event PaymentLinkCancelled(bytes32 indexed linkId, address indexed merchant);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _pmToken) {
        require(_pmToken != address(0), "Invalid token");
        pmToken = IERC20(_pmToken);
    }
    
    // ============ Payment Link Functions ============
    
    function createPaymentLink(
        uint256 amount,
        string calldata description,
        uint256 expiryTime
    ) external whenNotPaused returns (bytes32) {
        require(amount > 0, "Amount must be > 0");
        require(expiryTime > block.timestamp, "Invalid expiry time");
        
        bytes32 linkId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            description,
            block.timestamp,
            merchantLinks[msg.sender].length
        ));
        
        require(paymentLinks[linkId].merchant == address(0), "Link already exists");
        
        paymentLinks[linkId] = PaymentLink({
            merchant: msg.sender,
            amount: amount,
            description: description,
            expiryTime: expiryTime,
            isPaid: false,
            isCancelled: false,
            paidBy: address(0),
            paidAt: 0
        });
        
        merchantLinks[msg.sender].push(linkId);
        
        emit PaymentLinkCreated(linkId, msg.sender, amount, expiryTime);
        
        return linkId;
    }
    
    function payLink(bytes32 linkId) external whenNotPaused nonReentrant {
        PaymentLink storage link = paymentLinks[linkId];
        
        require(link.merchant != address(0), "Link not found");
        require(!link.isPaid, "Already paid");
        require(!link.isCancelled, "Link cancelled");
        require(block.timestamp <= link.expiryTime, "Link expired");
        
        uint256 fee = (link.amount * platformFee) / 10000;
        uint256 merchantAmount = link.amount - fee;
        
        pmToken.safeTransferFrom(msg.sender, address(this), link.amount);
        pmToken.safeTransfer(link.merchant, merchantAmount);
        
        link.isPaid = true;
        link.paidBy = msg.sender;
        link.paidAt = block.timestamp;
        accumulatedFees += fee;
        
        emit PaymentCompleted(linkId, msg.sender, link.amount, fee);
    }
    
    function cancelPaymentLink(bytes32 linkId) external {
        PaymentLink storage link = paymentLinks[linkId];
        
        require(link.merchant == msg.sender, "Not your link");
        require(!link.isPaid, "Already paid");
        require(!link.isCancelled, "Already cancelled");
        
        link.isCancelled = true;
        
        emit PaymentLinkCancelled(linkId, msg.sender);
    }
    
    // ============ Admin Functions ============
    
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
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
    
    function getPaymentLink(bytes32 linkId) external view returns (PaymentLink memory) {
        return paymentLinks[linkId];
    }
    
    function getMerchantLinks(address merchant) external view returns (bytes32[] memory) {
        return merchantLinks[merchant];
    }
    
    function getMerchantLinksCount(address merchant) external view returns (uint256) {
        return merchantLinks[merchant].length;
    }
    
    function isLinkValid(bytes32 linkId) external view returns (bool) {
        PaymentLink memory link = paymentLinks[linkId];
        return link.merchant != address(0) 
            && !link.isPaid 
            && !link.isCancelled 
            && block.timestamp <= link.expiryTime;
    }
}
