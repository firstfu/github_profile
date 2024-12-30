import { Octokit } from "@octokit/rest";

export interface GitHubUserData {
  username: string;
  name: string | null;
  bio: string | null;
  repos: number;
  followers: number;
  following: number;
  contributions: number;
  languages: { [key: string]: number };
  topRepos: Array<{
    name: string;
    description: string | null;
    stars: number;
    forks: number;
  }>;
}

class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getUserData(username: string): Promise<GitHubUserData> {
    try {
      // 獲取基本用戶信息
      const { data: user } = await this.octokit.users.getByUsername({
        username,
      });

      // 獲取倉庫列表
      const { data: repos } = await this.octokit.repos.listForUser({
        username,
        sort: "updated",
        direction: "desc",
        per_page: 10,
      });

      // 獲取語言統計
      const languages: { [key: string]: number } = {};
      for (const repo of repos) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }

      // 格式化倉庫數據，確保數值類型
      const topRepos = repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
      }));

      // TODO: 獲取貢獻數據（需要爬取用戶的 contributions calendar）

      return {
        username: user.login,
        name: user.name,
        bio: user.bio,
        repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        contributions: 0, // TODO: 實現貢獻數據抓取
        languages,
        topRepos,
      };
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      throw error;
    }
  }

  async updateProfile(username: string, content: string): Promise<void> {
    try {
      // 檢查是否存在 username/username 倉庫
      const { data: repo } = await this.octokit.repos
        .get({
          owner: username,
          repo: username,
        })
        .catch(() => ({ data: null }));

      if (!repo) {
        // 創建新倉庫
        await this.octokit.repos.createForAuthenticatedUser({
          name: username,
          auto_init: true,
          private: false,
          description: "My GitHub Profile",
        });
      }

      // 獲取現有 README.md 文件（如果存在）
      const { data: existingFile } = await this.octokit.repos
        .getContent({
          owner: username,
          repo: username,
          path: "README.md",
        })
        .catch(() => ({ data: null }));

      const message = "Update GitHub Profile";
      const contentBase64 = Buffer.from(content).toString("base64");

      if (existingFile && "sha" in existingFile) {
        // 更新現有文件
        await this.octokit.repos.createOrUpdateFileContents({
          owner: username,
          repo: username,
          path: "README.md",
          message,
          content: contentBase64,
          sha: existingFile.sha,
        });
      } else {
        // 創建新文件
        await this.octokit.repos.createOrUpdateFileContents({
          owner: username,
          repo: username,
          path: "README.md",
          message,
          content: contentBase64,
        });
      }
    } catch (error) {
      console.error("Error updating GitHub profile:", error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();
export default githubService;
