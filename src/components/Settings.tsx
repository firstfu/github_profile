import { useState, useEffect } from "react";

interface SettingsProps {
  onSave: (apiKey: string) => void;
}

export default function Settings({ onSave }: SettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    chrome.storage.sync.get(["openaiApiKey"], result => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      await new Promise<void>((resolve, reject) => {
        chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        });
      });

      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "INIT_OPENAI", apiKey }, response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          if (response?.error) {
            reject(new Error(response.error));
            return;
          }
          resolve();
        });
      });

      onSave(apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存設定時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[400px] h-[600px] p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">OpenAI API 金鑰</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={loading}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-[1px] border-solid border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            請輸入您的 OpenAI API 金鑰，用於生成 Profile 內容。 您可以在{" "}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
              OpenAI 網站
            </a>{" "}
            獲取 API 金鑰。
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey || loading}
          className={`
            w-full py-2 px-4 rounded-md
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {loading ? "儲存中..." : "儲存設定"}
        </button>
      </div>
    </div>
  );
}
