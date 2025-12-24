// Perfect Money Chrome Extension - Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Perfect Money Extension installed');
    // Open welcome page on install
    chrome.tabs.create({ url: 'https://perfectmoney.cc' });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBalance') {
    // Handle balance request
    chrome.storage.local.get(['balance'], (result) => {
      sendResponse({ balance: result.balance || '0' });
    });
    return true; // Required for async response
  }
  
  if (request.action === 'updateBalance') {
    // Update stored balance
    chrome.storage.local.set({ balance: request.balance });
    sendResponse({ success: true });
  }
});

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
  // This is triggered if popup is not set
  chrome.tabs.create({ url: 'https://perfectmoney.cc/dashboard' });
});
