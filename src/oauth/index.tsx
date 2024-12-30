import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const OAuthHandler: React.FC = () => {
  const [status, setStatus] = useState<"處理中" | "成功" | "失敗">("處理中");

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("未收到授權碼");
        }

        // 使用授權碼換取訪問令牌
        const response = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
            client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        const data = await response.json();

        if (data.error || !data.access_token) {
          throw new Error(data.error_description || "獲取訪問令牌失敗");
        }

        // 將訪問令牌保存到 Chrome 存儲中
        await chrome.storage.sync.set({ github_token: data.access_token });

        setStatus("成功");

        // 關閉當前視窗
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (error) {
        console.error("OAuth 處理失敗:", error);
        setStatus("失敗");
      }
    };

    handleOAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">GitHub 授權</h1>
        {status === "處理中" && <p className="text-gray-600">正在處理授權請求...</p>}
        {status === "成功" && <p className="text-green-600">授權成功！正在關閉視窗...</p>}
        {status === "失敗" && <p className="text-red-600">授權失敗，請重試。</p>}
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<OAuthHandler />);
}
