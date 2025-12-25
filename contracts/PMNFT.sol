// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PMNFT
 * @dev NFT collection for Perfect Money ecosystem
 */
contract PMNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    
    IERC20 public immutable pmToken;
    
    // Minting settings
    uint256 public mintPrice = 100 * 1e18; // 100 PM tokens
    uint256 public maxSupply = 10000;
    uint256 public maxPerWallet = 10;
    
    // Royalty settings
    uint256 public royaltyFee = 250; // 2.5%
    address public royaltyReceiver;
    
    // Whitelist
    mapping(address => bool) public isWhitelisted;
    bool public whitelistOnly = true;
    
    // User mints tracking
    mapping(address => uint256) public userMints;
    
    // Events
    event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 newPrice);
    event RoyaltyUpdated(address receiver, uint256 fee);
    
    constructor(address _pmToken) ERC721("Perfect Money NFT", "PMNFT") {
        require(_pmToken != address(0), "Invalid token");
        pmToken = IERC20(_pmToken);
        royaltyReceiver = msg.sender;
    }
    
    // ============ Minting Functions ============
    
    function mint(string calldata tokenURI_) external whenNotPaused nonReentrant returns (uint256) {
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        require(userMints[msg.sender] < maxPerWallet, "Max per wallet reached");
        
        if (whitelistOnly) {
            require(isWhitelisted[msg.sender], "Not whitelisted");
        }
        
        pmToken.safeTransferFrom(msg.sender, address(this), mintPrice);
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);
        
        userMints[msg.sender]++;
        
        emit NFTMinted(msg.sender, newTokenId, tokenURI_);
        
        return newTokenId;
    }
    
    function batchMint(string[] calldata tokenURIs) external whenNotPaused nonReentrant returns (uint256[] memory) {
        uint256 quantity = tokenURIs.length;
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(_tokenIds.current() + quantity <= maxSupply, "Exceeds max supply");
        require(userMints[msg.sender] + quantity <= maxPerWallet, "Exceeds max per wallet");
        
        if (whitelistOnly) {
            require(isWhitelisted[msg.sender], "Not whitelisted");
        }
        
        uint256 totalCost = mintPrice * quantity;
        pmToken.safeTransferFrom(msg.sender, address(this), totalCost);
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _safeMint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);
            
            tokenIds[i] = newTokenId;
            emit NFTMinted(msg.sender, newTokenId, tokenURIs[i]);
        }
        
        userMints[msg.sender] += quantity;
        
        return tokenIds;
    }
    
    // ============ Admin Functions ============
    
    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
        emit MintPriceUpdated(_price);
    }
    
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply >= _tokenIds.current(), "Cannot reduce below minted");
        maxSupply = _maxSupply;
    }
    
    function setMaxPerWallet(uint256 _max) external onlyOwner {
        maxPerWallet = _max;
    }
    
    function setWhitelistStatus(address[] calldata addresses, bool status) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            isWhitelisted[addresses[i]] = status;
        }
    }
    
    function setWhitelistOnly(bool _whitelistOnly) external onlyOwner {
        whitelistOnly = _whitelistOnly;
    }
    
    function setRoyalty(address _receiver, uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        royaltyReceiver = _receiver;
        royaltyFee = _fee;
        emit RoyaltyUpdated(_receiver, _fee);
    }
    
    function withdrawTokens() external onlyOwner {
        uint256 balance = pmToken.balanceOf(address(this));
        if (balance > 0) {
            pmToken.safeTransfer(owner(), balance);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function totalMinted() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    function remainingSupply() external view returns (uint256) {
        return maxSupply - _tokenIds.current();
    }
    
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyFee) / 10000;
        return (royaltyReceiver, royaltyAmount);
    }
    
    // ============ Required Overrides ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
