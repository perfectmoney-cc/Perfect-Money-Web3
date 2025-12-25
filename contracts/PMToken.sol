// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PMToken
 * @dev Perfect Money Token - Main utility token for the PM ecosystem
 */
contract PMToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Anti-whale settings
    uint256 public maxWalletBalance;
    uint256 public maxTransactionAmount;
    bool public antiWhaleEnabled;
    
    // Excluded addresses from anti-whale
    mapping(address => bool) public isExcludedFromAntiWhale;
    
    // Trading control
    bool public tradingEnabled;
    
    // Events
    event TradingEnabled(bool enabled);
    event AntiWhaleUpdated(bool enabled, uint256 maxWallet, uint256 maxTx);
    event ExcludedFromAntiWhale(address indexed account, bool excluded);
    
    constructor() ERC20("Perfect Money", "PM") {
        // Mint initial supply to deployer
        _mint(msg.sender, MAX_SUPPLY);
        
        // Set initial anti-whale limits (2% of supply)
        maxWalletBalance = MAX_SUPPLY * 2 / 100;
        maxTransactionAmount = MAX_SUPPLY * 1 / 100;
        antiWhaleEnabled = true;
        
        // Exclude owner from anti-whale
        isExcludedFromAntiWhale[msg.sender] = true;
        isExcludedFromAntiWhale[address(0)] = true;
    }
    
    function enableTrading() external onlyOwner {
        tradingEnabled = true;
        emit TradingEnabled(true);
    }
    
    function setAntiWhale(
        bool _enabled,
        uint256 _maxWalletBalance,
        uint256 _maxTransactionAmount
    ) external onlyOwner {
        antiWhaleEnabled = _enabled;
        maxWalletBalance = _maxWalletBalance;
        maxTransactionAmount = _maxTransactionAmount;
        emit AntiWhaleUpdated(_enabled, _maxWalletBalance, _maxTransactionAmount);
    }
    
    function excludeFromAntiWhale(address account, bool excluded) external onlyOwner {
        isExcludedFromAntiWhale[account] = excluded;
        emit ExcludedFromAntiWhale(account, excluded);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting and burning
        if (from == address(0) || to == address(0)) return;
        
        // Check trading enabled (except for owner)
        if (!tradingEnabled && from != owner() && to != owner()) {
            revert("Trading not enabled yet");
        }
        
        // Anti-whale checks
        if (antiWhaleEnabled) {
            if (!isExcludedFromAntiWhale[from] && !isExcludedFromAntiWhale[to]) {
                require(amount <= maxTransactionAmount, "Exceeds max transaction");
                require(balanceOf(to) + amount <= maxWalletBalance, "Exceeds max wallet");
            }
        }
    }
}
