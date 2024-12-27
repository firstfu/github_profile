import { github } from "../utils/github";

// 檢查是否在用戶的 GitHub Profile 頁面
function isProfilePage() {
  const path = window.location.pathname;
  const username = path.split("/")[1];
  return path === `/${username}/${username}`;
}

// 獲取用戶的 GitHub 資料
async function getUserData() {
  try {
    const username = window.location.pathname.split("/")[1];
    const data = await github.getUserData(username);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return { success: false, error: (error as Error).message };
  }
}

// 監聽來自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_PROFILE_PAGE") {
    sendResponse({ isProfilePage: isProfilePage() });
  }

  if (request.type === "GET_USER_DATA") {
    getUserData()
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
