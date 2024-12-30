import OpenAI from "openai";
import { GitHubUserData } from "./github";

class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateProfile(userData: GitHubUserData): Promise<string> {
    try {
      const prompt = this.createPrompt(userData);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "你是一個專業的技術文檔撰寫專家，擅長創作吸引人的 GitHub Profile。你需要根據提供的用戶數據，生成一個美觀、專業的 GitHub Profile README.md 文件。使用 Markdown 格式，包含適當的表情符號，並確保內容既專業又有個性。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating profile:", error);
      throw error;
    }
  }

  private createPrompt(userData: GitHubUserData): string {
    const { username, name, bio, repos, followers, following, contributions, languages, topRepos } = userData;

    const languagesStr = Object.entries(languages)
      .map(([lang, count]) => `${lang} (${count} repos)`)
      .join(", ");

    const topReposStr = topRepos.map(repo => `- ${repo.name}: ${repo.description || "No description"} (⭐ ${repo.stars}, 🔄 ${repo.forks})`).join("\n");

    return `請為以下 GitHub 用戶生成一個專業且吸引人的 Profile README.md：

用戶信息：
- 用戶名：${username}
- 名稱：${name || username}
- 簡介：${bio || "無"}
- 公開倉庫數：${repos}
- 關注者：${followers}
- 正在關注：${following}
- 今年貢獻：${contributions}

主要程式語言：
${languagesStr}

熱門倉庫：
${topReposStr}

請生成一個包含以下部分的 README.md：
1. 個性化的歡迎標語
2. 關於我（基於簡介和統計數據）
3. 技術棧展示（基於語言使用情況）
4. 項目展示（基於熱門倉庫）
5. GitHub 統計展示（使用統計圖表）
6. 如何聯繫我

請使用適當的 Markdown 語法和表情符號使文檔更生動。確保包含適當的標題、列表、表格等格式元素。`;
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
