import { github } from "../utils/github";

// 檢查是否在用戶的 GitHub Profile 頁面
function isProfilePage() {
  const path = window.location.pathname;
  const pathParts = path.split("/").filter(Boolean);
  // 檢查是否只有用戶名的路徑（例如：/username）且不是特殊頁面
  return pathParts.length === 1 && !["settings", "notifications", "explore"].includes(pathParts[0]);
}

// 獲取用戶的 GitHub 資料
async function getUserData() {
  try {
    const username = window.location.pathname.split("/")[1];
    if (!username) {
      throw new Error("無法取得用戶名稱");
    }
    const data = await github.getUserData(username);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return { success: false, error: (error as Error).message };
  }
}

// 初始化 content script
function initContentScript() {
  console.log("Content script initialized");

  // 監聽來自 popup 的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message:", request);

    if (request.type === "CHECK_PROFILE_PAGE") {
      const result = { isProfilePage: isProfilePage() };
      console.log("Checking profile page:", result);
      sendResponse(result);
      return true;
    }

    if (request.type === "GET_USER_DATA") {
      getUserData()
        .then(response => {
          console.log("Got user data:", response);
          sendResponse(response);
        })
        .catch(error => {
          console.error("Error getting user data:", error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "獲取用戶資料時發生錯誤",
          });
        });
      return true; // 非同步回應
    }
  });
}

// 確保 content script 只初始化一次
if (!window.contentScriptInitialized) {
  window.contentScriptInitialized = true;
  initContentScript();
}

// 為了 TypeScript 的型別檢查
declare global {
  interface Window {
    contentScriptInitialized?: boolean;
  }
}
