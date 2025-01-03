import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { githubService, GitHubUserData } from "@/services/github";
import { openaiService } from "@/services/openai";
import ReactMarkdown from "react-markdown";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [githubData, setGithubData] = useState<GitHubUserData | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkGitHubAuth();
  }, []);

  const checkGitHubAuth = async () => {
    try {
      chrome.storage.sync.get(["github_token"], async result => {
        if (result.github_token) {
          const username = await getCurrentUsername();
          if (username) {
            const data = await githubService.getUserData(username);
            setGithubData(data);
          }
        }
      });
    } catch (err) {
      setError("GitHub 授權檢查失敗");
      console.error(err);
    }
  };

  const getCurrentUsername = async (): Promise<string | null> => {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        const url = tab.url || "";
        const match = url.match(/github\.com\/([^/]+)/);
        resolve(match ? match[1] : null);
      });
    });
  };

  const handleGenerateProfile = async () => {
    if (!githubData) return;

    setIsLoading(true);
    try {
      const profile = await openaiService.generateProfile(githubData);
      setGeneratedProfile(profile);
    } catch (err) {
      setError("生成 Profile 失敗");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!githubData || !generatedProfile) return;

    setIsLoading(true);
    try {
      await githubService.updateProfile(githubData.username, generatedProfile);
      setError("Profile 更新成功！");
    } catch (err) {
      setError("更新 Profile 失敗");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = chrome.runtime.getURL("src/oauth/index.html");
    const scope = "repo";

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    chrome.windows.create({
      url: authUrl,
      type: "popup",
      width: 800,
      height: 600,
    });
  };

  return (
    <div className="w-[600px] min-h-[400px] p-4 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">GitHub Profile Generator</h1>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      {!githubData ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="mb-4 text-gray-600 dark:text-gray-400">請先登入 GitHub 以使用此功能</p>
          <Button className="w-48" onClick={handleLogin}>
            登入 GitHub
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">GitHub 統計</h2>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
              <div>用戶名：{githubData.username}</div>
              <div>倉庫數：{githubData.repos}</div>
              <div>關注者：{githubData.followers}</div>
              <div>貢獻數：{githubData.contributions}</div>
            </div>
          </div>

          <Button className="w-full" onClick={handleGenerateProfile} disabled={isLoading}>
            {isLoading ? "生成中..." : "生成 Profile"}
          </Button>

          {generatedProfile && (
            <>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">預覽</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{generatedProfile}</ReactMarkdown>
                </div>
              </div>

              <Button className="w-full" onClick={handleUpdateProfile} disabled={isLoading}>
                更新 Profile
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
