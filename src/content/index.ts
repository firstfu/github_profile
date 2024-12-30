// 檢查是否在 GitHub 頁面
if (window.location.hostname === "github.com") {
  // 獲取當前頁面的用戶名
  const username = window.location.pathname.split("/")[1];

  // 檢查是否在用戶的個人頁面
  if (username && !window.location.pathname.split("/")[2]) {
    console.log("GitHub Profile AI Generator 已在用戶頁面啟動");

    // 向 background script 請求 GitHub token
    chrome.runtime.sendMessage({ type: "GET_GITHUB_TOKEN" }, response => {
      if (response && response.token) {
        console.log("已獲取 GitHub token");
      }
    });
  }
}
