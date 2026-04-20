import { ApiError } from "./http.js";
import { requireEnv } from "./env.js";
import { isLowQualityCommitMessage, type ContributionInput } from "./scoring.js";

type GitHubProfile = {
  id: number;
  login: string;
  avatar_url: string | null;
};

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  fork: boolean;
  stargazers_count: number;
  owner: {
    login: string;
  };
};

type SearchResponse<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

type CommitSearchItem = {
  commit: {
    message: string;
  };
};

type GitHubRequestOptions = {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
  accept?: string;
};

export type GitHubAggregateResult = {
  profile: {
    githubId: string;
    githubUsername: string;
    avatarUrl: string | null;
  };
  stats: ContributionInput;
  warnings: string[];
};

const DEFAULT_ACCEPT = "application/vnd.github+json";
const MAX_SEARCH_PAGES = 10;

function parseNextUrl(linkHeader: string | null) {
  if (!linkHeader) {
    return undefined;
  }

  const nextLink = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="next"'));

  return nextLink?.match(/<([^>]+)>/)?.[1];
}

function getRateLimitDetails(response: Response) {
  return {
    remaining: response.headers.get("x-ratelimit-remaining"),
    reset: response.headers.get("x-ratelimit-reset")
  };
}

async function githubRequest<T>(url: string, options: GitHubRequestOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: options.accept ?? DEFAULT_ACCEPT,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 403 || response.status === 429) {
    const rateLimit = getRateLimitDetails(response);
    if (rateLimit.remaining === "0") {
      throw new ApiError("RATE_LIMITED", "GitHub API rate limit exceeded", {
        resetAt: rateLimit.reset ? new Date(Number(rateLimit.reset) * 1000).toISOString() : undefined
      });
    }
  }

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    throw new ApiError("UPSTREAM_ERROR", `GitHub API request failed with ${response.status}`, details);
  }

  return (await response.json()) as T;
}

async function githubPaginatedRequest<T>(
  url: string,
  token: string,
  options: Pick<GitHubRequestOptions, "accept"> & { maxPages?: number } = {}
) {
  const results: T[] = [];
  let nextUrl: string | undefined = url;
  let page = 0;

  while (nextUrl && page < (options.maxPages ?? Number.POSITIVE_INFINITY)) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: options.accept ?? DEFAULT_ACCEPT,
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 403 || response.status === 429) {
      const rateLimit = getRateLimitDetails(response);
      if (rateLimit.remaining === "0") {
        throw new ApiError("RATE_LIMITED", "GitHub API rate limit exceeded", {
          resetAt: rateLimit.reset ? new Date(Number(rateLimit.reset) * 1000).toISOString() : undefined
        });
      }
    }

    if (!response.ok) {
      throw new ApiError("UPSTREAM_ERROR", `GitHub API request failed with ${response.status}`, {
        url: nextUrl
      });
    }

    results.push(...((await response.json()) as T[]));
    nextUrl = parseNextUrl(response.headers.get("link"));
    page += 1;
  }

  return results;
}

export async function exchangeGitHubCode(code: string) {
  const response = await githubRequest<{
    access_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  }>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      accept: "application/json",
      body: {
        client_id: requireEnv("GITHUB_CLIENT_ID"),
        client_secret: requireEnv("GITHUB_CLIENT_SECRET"),
        code,
        redirect_uri: requireEnv("GITHUB_REDIRECT_URI")
      }
    }
  );

  if (!response.access_token) {
    throw new ApiError("UNAUTHORIZED", response.error_description ?? "GitHub OAuth exchange failed", response);
  }

  return {
    accessToken: response.access_token,
    tokenType: response.token_type,
    scope: response.scope
  };
}

export async function fetchGitHubProfile(token: string) {
  const profile = await githubRequest<GitHubProfile>("https://api.github.com/user", { token });

  return {
    githubId: String(profile.id),
    githubUsername: profile.login,
    avatarUrl: profile.avatar_url
  };
}

async function fetchRepositories(token: string) {
  return githubPaginatedRequest<GitHubRepository>(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    token
  );
}

async function fetchSearchCount(token: string, query: string) {
  const url = `https://api.github.com/search/issues?per_page=1&q=${encodeURIComponent(query)}`;
  const result = await githubRequest<SearchResponse<unknown>>(url, { token });
  return result.total_count;
}

async function fetchCommitCount(token: string, username: string) {
  const query = `author:${username}`;
  const firstUrl = `https://api.github.com/search/commits?per_page=100&q=${encodeURIComponent(query)}`;
  const firstPage = await githubRequest<SearchResponse<CommitSearchItem>>(firstUrl, {
    token,
    accept: "application/vnd.github.cloak-preview+json"
  });

  const sampledItems = [...firstPage.items];

  for (let page = 2; page <= MAX_SEARCH_PAGES; page += 1) {
    if (sampledItems.length >= Math.min(firstPage.total_count, MAX_SEARCH_PAGES * 100)) {
      break;
    }

    const pageUrl = `${firstUrl}&page=${page}`;
    const pageResult = await githubRequest<SearchResponse<CommitSearchItem>>(pageUrl, {
      token,
      accept: "application/vnd.github.cloak-preview+json"
    });
    sampledItems.push(...pageResult.items);
  }

  const qualityCommits = sampledItems.filter(
    (item) => !isLowQualityCommitMessage(item.commit.message)
  ).length;

  if (firstPage.total_count <= sampledItems.length) {
    return qualityCommits;
  }

  const qualityRatio = sampledItems.length > 0 ? qualityCommits / sampledItems.length : 0;
  return Math.round(firstPage.total_count * qualityRatio);
}

export async function fetchGitHubContributionStats(token: string): Promise<GitHubAggregateResult> {
  const profile = await fetchGitHubProfile(token);
  const repos = await fetchRepositories(token);
  const ownNonForkRepos = repos.filter(
    (repo) => repo.owner.login.toLowerCase() === profile.githubUsername.toLowerCase() && !repo.fork
  );

  const [commits, pullRequests, issuesCreated, issuesResolved] = await Promise.all([
    fetchCommitCount(token, profile.githubUsername),
    fetchSearchCount(token, `author:${profile.githubUsername} type:pr is:merged`),
    fetchSearchCount(token, `author:${profile.githubUsername} type:issue`),
    fetchSearchCount(token, `closed-by:${profile.githubUsername} type:issue`)
  ]);

  const stars = ownNonForkRepos.reduce((total, repo) => total + repo.stargazers_count, 0);
  const warnings: string[] = [];

  if (repos.length >= 1000) {
    warnings.push("Repository aggregation was capped by GitHub pagination safeguards.");
  }

  return {
    profile,
    stats: {
      commits,
      pullRequests,
      issues: issuesCreated + issuesResolved,
      stars,
      repositories: ownNonForkRepos.length
    },
    warnings
  };
}
