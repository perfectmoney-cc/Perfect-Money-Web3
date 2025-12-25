// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title PMAirdrop
 * @dev Merkle-tree based airdrop with multiple rounds and claim tracking
 */
contract PMAirdrop is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pmToken;
    
    struct AirdropRound {
        bytes32 merkleRoot;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    mapping(uint256 => AirdropRound) public airdropRounds;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    uint256 public currentRound;
    uint256 public totalAirdropped;
    
    // Events
    event RoundCreated(uint256 indexed round, bytes32 merkleRoot, uint256 totalAmount, uint256 startTime, uint256 endTime);
    event TokensClaimed(uint256 indexed round, address indexed user, uint256 amount);
    event RoundEnded(uint256 indexed round, uint256 claimedAmount, uint256 unclaimedAmount);
    
    constructor(address _pmToken) {
        require(_pmToken != address(0), "Invalid token");
        pmToken = IERC20(_pmToken);
    }
    
    // ============ Claim Functions ============
    
    function claim(
        uint256 round,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external whenNotPaused nonReentrant {
        AirdropRound storage airdrop = airdropRounds[round];
        
        require(airdrop.isActive, "Round not active");
        require(block.timestamp >= airdrop.startTime, "Round not started");
        require(block.timestamp <= airdrop.endTime, "Round ended");
        require(!hasClaimed[round][msg.sender], "Already claimed");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, airdrop.merkleRoot, leaf), "Invalid proof");
        
        hasClaimed[round][msg.sender] = true;
        airdrop.claimedAmount += amount;
        totalAirdropped += amount;
        
        pmToken.safeTransfer(msg.sender, amount);
        
        emit TokensClaimed(round, msg.sender, amount);
    }
    
    // ============ Admin Functions ============
    
    function createRound(
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner {
        require(startTime < endTime, "Invalid times");
        require(totalAmount > 0, "Invalid amount");
        require(pmToken.balanceOf(address(this)) >= totalAmount, "Insufficient balance");
        
        currentRound++;
        
        airdropRounds[currentRound] = AirdropRound({
            merkleRoot: merkleRoot,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            isActive: true
        });
        
        emit RoundCreated(currentRound, merkleRoot, totalAmount, startTime, endTime);
    }
    
    function endRound(uint256 round) external onlyOwner {
        AirdropRound storage airdrop = airdropRounds[round];
        require(airdrop.isActive, "Round not active");
        
        airdrop.isActive = false;
        
        uint256 unclaimed = airdrop.totalAmount - airdrop.claimedAmount;
        emit RoundEnded(round, airdrop.claimedAmount, unclaimed);
    }
    
    function updateMerkleRoot(uint256 round, bytes32 newRoot) external onlyOwner {
        require(airdropRounds[round].isActive, "Round not active");
        airdropRounds[round].merkleRoot = newRoot;
    }
    
    function withdrawUnclaimed(uint256 round) external onlyOwner {
        AirdropRound storage airdrop = airdropRounds[round];
        require(!airdrop.isActive, "Round still active");
        require(block.timestamp > airdrop.endTime, "Round not ended");
        
        uint256 unclaimed = airdrop.totalAmount - airdrop.claimedAmount;
        if (unclaimed > 0) {
            airdrop.totalAmount = airdrop.claimedAmount; // Prevent double withdrawal
            pmToken.safeTransfer(owner(), unclaimed);
        }
    }
    
    function depositTokens(uint256 amount) external onlyOwner {
        pmToken.safeTransferFrom(msg.sender, address(this), amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getRoundInfo(uint256 round) external view returns (AirdropRound memory) {
        return airdropRounds[round];
    }
    
    function canClaim(
        uint256 round,
        address user,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        AirdropRound memory airdrop = airdropRounds[round];
        
        if (!airdrop.isActive) return false;
        if (block.timestamp < airdrop.startTime) return false;
        if (block.timestamp > airdrop.endTime) return false;
        if (hasClaimed[round][user]) return false;
        
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        return MerkleProof.verify(merkleProof, airdrop.merkleRoot, leaf);
    }
    
    function getClaimStatus(uint256 round, address user) external view returns (bool) {
        return hasClaimed[round][user];
    }
}
