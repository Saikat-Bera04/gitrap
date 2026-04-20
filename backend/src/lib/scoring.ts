export type ContributionInput = {
  commits: number;
  pullRequests: number;
  issues: number;
  stars: number;
  repositories: number;
};

export type ScoreBreakdown = {
  normalized: ContributionInput;
  weights: {
    commits: 1;
    pullRequests: 5;
    issues: 3;
    stars: 0.5;
  };
  contributions: {
    commits: number;
    pullRequests: number;
    issues: number;
    stars: number;
  };
  rawScore: number;
  score: number;
};

const SOFT_CAPS: ContributionInput = {
  commits: 5000,
  pullRequests: 1000,
  issues: 1000,
  stars: 10000,
  repositories: 500
};

export function isLowQualityCommitMessage(message: string) {
  const subject = message.split("\n")[0]?.trim().toLowerCase() ?? "";

  if (!subject) {
    return true;
  }

  if (subject.length < 8) {
    return true;
  }

  const noisyPatterns = [
    /^merge\b/,
    /^revert\b/,
    /^wip\b/,
    /^tmp\b/,
    /^test\b/,
    /^fix\b$/,
    /^update\b$/,
    /^changes\b$/,
    /^minor\b/,
    /^bump\b/,
    /version bump/,
    /package-lock\.json/,
    /yarn\.lock/
  ];

  return noisyPatterns.some((pattern) => pattern.test(subject));
}

export function normalizeStat(value: number, softCap: number) {
  const safeValue = Math.max(0, Math.floor(value));

  if (safeValue <= softCap) {
    return safeValue;
  }

  return Math.floor(softCap + Math.sqrt(safeValue - softCap) * Math.sqrt(softCap));
}

export function computeScore(stats: ContributionInput): ScoreBreakdown {
  const normalized: ContributionInput = {
    commits: normalizeStat(stats.commits, SOFT_CAPS.commits),
    pullRequests: normalizeStat(stats.pullRequests, SOFT_CAPS.pullRequests),
    issues: normalizeStat(stats.issues, SOFT_CAPS.issues),
    stars: normalizeStat(stats.stars, SOFT_CAPS.stars),
    repositories: normalizeStat(stats.repositories, SOFT_CAPS.repositories)
  };

  const contributions = {
    commits: normalized.commits * 1,
    pullRequests: normalized.pullRequests * 5,
    issues: normalized.issues * 3,
    stars: normalized.stars * 0.5
  };

  const rawScore =
    contributions.commits + contributions.pullRequests + contributions.issues + contributions.stars;

  return {
    normalized,
    weights: {
      commits: 1,
      pullRequests: 5,
      issues: 3,
      stars: 0.5
    },
    contributions,
    rawScore,
    score: Math.round(rawScore)
  };
}
