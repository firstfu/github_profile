import { useState, useEffect } from "react";
import MarkdownPreview from "../components/MarkdownPreview";
import Settings from "../components/Settings";

interface GenerateResponse {
  success?: boolean;
  error?: string;
  data?: string;
}

interface UserDataResponse {
  success?: boolean;
  error?: string;
  data?: any;
}

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState("professional");
  const [content, setContent] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // 檢查是否已設定 API key
    chrome.storage.sync.get(["openaiApiKey"], result => {
      setHasApiKey(!!result.openaiApiKey);
      if (!result.openaiApiKey) {
        setShowSettings(true);
      }
    });

    // 檢查是否在 Profile 頁面
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      const tabId = tab?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: "CHECK_PROFILE_PAGE" }, response => {
          if (!response?.isProfilePage) {
            setContent("請前往您的 GitHub Profile 頁面使用此擴充功能");
          }
        });
      }
    });
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 獲取用戶資料
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tab?.id;
      if (!tabId) return;

      const userData = await new Promise<UserDataResponse>(resolve => {
        chrome.tabs.sendMessage(tabId, { type: "GET_USER_DATA" }, response => {
          resolve(response);
        });
      });

      if (userData.error) {
        throw new Error(userData.error);
      }

      // 生成 Profile
      const response = await new Promise<GenerateResponse>(resolve => {
        chrome.runtime.sendMessage(
          {
            type: "GENERATE_PROFILE",
            data: {
              style,
              userData: userData.data,
            },
          },
          response => {
            resolve(response);
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setContent(response.data || "");
    } catch (error) {
      console.error(error);
      setContent("生成失敗，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSettings = (apiKey: string) => {
    setHasApiKey(!!apiKey);
    setShowSettings(false);
    chrome.runtime.sendMessage({ type: "INIT_OPENAI", apiKey });
  };

  if (showSettings) {
    return <Settings onSave={handleSaveSettings} />;
  }

  return (
    <div className="w-[400px] h-[600px] p-4 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Profile AI Generator</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ⚙️
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">生成風格</label>
          <select
            value={style}
            onChange={e => setStyle(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-[1px] border-solid border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="professional">專業簡潔</option>
            <option value="creative">活潑創意</option>
            <option value="technical">技術導向</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !hasApiKey}
          className={`
            w-full py-2 px-4 rounded-md
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {isGenerating ? "生成中..." : "一鍵生成 Profile"}
        </button>
      </div>

      <div className="mt-4 flex-1">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">預覽</div>
        <div className="w-full h-[350px] bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-auto border-[1px] border-solid border-gray-200 dark:border-gray-700">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
