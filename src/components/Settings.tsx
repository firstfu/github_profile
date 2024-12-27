import { useState, useEffect } from "react";

interface SettingsProps {
  onSave: (apiKey: string) => void;
}

export default function Settings({ onSave }: SettingsProps) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // 從 Chrome storage 讀取 API key
    chrome.storage.sync.get(["openaiApiKey"], result => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
    });
  }, []);

  const handleSave = () => {
    // 儲存 API key 到 Chrome storage
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      onSave(apiKey);
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">設定</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">OpenAI API 金鑰</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-[1px] border-solid border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>

      <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
        儲存設定
      </button>
    </div>
  );
}
