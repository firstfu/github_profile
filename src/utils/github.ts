interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export const github = {
  getUser: async (username: string): Promise<GitHubUser> => {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return response.json();
  },

  getRepos: async (username: string): Promise<GitHubRepo[]> => {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=10`);
    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }
    return response.json();
  },

  getLanguages: async (username: string): Promise<Record<string, number>> => {
    const repos = await github.getRepos(username);
    const languages: Record<string, number> = {};

    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    return languages;
  },

  getUserData: async (username: string) => {
    const [user, repos, languages] = await Promise.all([github.getUser(username), github.getRepos(username), github.getLanguages(username)]);

    return {
      user,
      repos,
      languages,
    };
  },
};
