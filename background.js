// Background service worker for Dopamine Guard

// Listen for web navigation to check blocked domains
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId !== 0) return;

  const url = new URL(details.url);
  const hostname = url.hostname.replace(/^www\./, '');

  const { blockedDomains = [] } = await chrome.storage.sync.get('blockedDomains');

  const isBlocked = blockedDomains.some(domain => {
    const clean = domain.replace(/^www\./, '');
    return hostname === clean || hostname.endsWith('.' + clean);
  });

  if (isBlocked) {
    // Send message to content script to show the overlay
    chrome.tabs.sendMessage(details.tabId, {
      type: 'SHOW_GUARD',
      domain: hostname
    }).catch(() => {
      // Content script may not be ready yet — inject it
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js']
      });
      chrome.scripting.insertCSS({
        target: { tabId: details.tabId },
        files: ['content.css']
      });
    });
  }
});
