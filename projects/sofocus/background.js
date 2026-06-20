chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "sofocus-capture",
      title: "Capture Insight (SoFocus)",
      contexts: ["all"],
      documentUrlPatterns: ["*://*.youtube.com/watch*"]
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sofocus-capture" && tab) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_CAPTURE_OVERLAY' });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'capture-insight') {
    try {
      // Get the active tab in the current window
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if it's a YouTube watch URL
      if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
        // Send message to the content script on that tab
        await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_CAPTURE_OVERLAY' });
      } else {
        console.log("Not a YouTube watch page, or no active tab.", tab?.url);
      }
    } catch (error) {
      console.error("Error sending message to content script:", error);
    }
  }
});
