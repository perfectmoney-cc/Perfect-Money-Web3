// Perfect Money Chrome Extension - Popup Script

const BASE_URL = 'https://perfectmoney.cc';

function openApp(path) {
  const url = path ? `${BASE_URL}/dashboard/${path}` : BASE_URL;
  chrome.tabs.create({ url });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Check if user has stored wallet data
  chrome.storage.local.get(['walletAddress', 'balance'], (result) => {
    if (result.walletAddress) {
      const balanceEl = document.querySelector('.balance');
      if (balanceEl && result.balance) {
        balanceEl.textContent = `${result.balance} PM`;
      }
    }
  });
});
