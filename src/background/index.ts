
// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_GITHUB_TOKEN') {
    chrome.storage.sync.get(['github_token'], (result) => {
      sendResponse({ token: result.github_token });
    });
    return true;
  }
});
    