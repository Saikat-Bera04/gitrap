import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { ApiError } from "./http.js";
import { decryptSecret, encryptSecret } from "./crypto.js";
import {
  exchangeGitHubCode,
  fetchGitHubContributionStats,
  fetchGitHubProfile,
  type GitHubAggregateResult
} from "./github.js";
import { computeScore } from "./scoring.js";
import { env } from "./env.js";

const userSelect = {
  id: true,
  walletAddress: true,
  githubUsername: true,
  githubId: true,
  avatarUrl: true,
  score: true,
  lastUpdated: true,
  createdAt: true,
  stats: true
} satisfies Prisma.UserSelect;

export function getUserSelect() {
  return userSelect;
}

export function isCacheFresh(lastUpdated: Date | null | undefined) {
  if (!lastUpdated) {
    return false;
  }

  const maxAgeMs = env.SCORE_CACHE_MINUTES * 60 * 1000;
  return Date.now() - lastUpdated.getTime() < maxAgeMs;
}

export async function refreshUserStats(userId: string, accessToken?: string) {
  const token = accessToken ?? (await getStoredGitHubToken(userId));
  const aggregate = await fetchGitHubContributionStats(token);

  await assertTokenBelongsToUser(userId, aggregate.profile.githubId);

  return persistAggregate(userId, aggregate);
}

export async function authenticateWithGitHubCode(code: string, walletAddress: string) {
  const oauth = await exchangeGitHubCode(code);
  const aggregate = await fetchGitHubContributionStats(oauth.accessToken);
  const score = computeScore(aggregate.stats);
  const encryptedToken = encryptSecret(oauth.accessToken);

  const existingGithubUser = await prisma.user.findUnique({
    where: { githubId: aggregate.profile.githubId },
    select: { id: true, walletAddress: true }
  });

  if (existingGithubUser && existingGithubUser.walletAddress !== walletAddress) {
    throw new ApiError("CONFLICT", "This GitHub account is already linked to another wallet");
  }

  const user = await prisma.$transaction(async (tx) => {
    const savedUser = await tx.user.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        githubUsername: aggregate.profile.githubUsername,
        githubId: aggregate.profile.githubId,
        avatarUrl: aggregate.profile.avatarUrl,
        score: score.score,
        lastUpdated: new Date(),
        stats: {
          create: aggregate.stats
        }
      },
      update: {
        githubUsername: aggregate.profile.githubUsername,
        githubId: aggregate.profile.githubId,
        avatarUrl: aggregate.profile.avatarUrl,
        score: score.score,
        lastUpdated: new Date(),
        stats: {
          upsert: {
            create: aggregate.stats,
            update: aggregate.stats
          }
        }
      },
      select: userSelect
    });

    await tx.gitHubAccount.upsert({
      where: { userId: savedUser.id },
      create: {
        userId: savedUser.id,
        accessTokenEncrypted: encryptedToken.encrypted,
        accessTokenIv: encryptedToken.iv,
        accessTokenTag: encryptedToken.tag,
        tokenType: oauth.tokenType,
        scope: oauth.scope
      },
      update: {
        accessTokenEncrypted: encryptedToken.encrypted,
        accessTokenIv: encryptedToken.iv,
        accessTokenTag: encryptedToken.tag,
        tokenType: oauth.tokenType,
        scope: oauth.scope
      }
    });

    return savedUser;
  });

  return {
    user,
    score,
    warnings: aggregate.warnings
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect
  });

  if (!user) {
    throw new ApiError("NOT_FOUND", "User not found");
  }

  return user;
}

export async function getScore(userId: string) {
  const user = await getProfile(userId);
  const stats = user.stats ?? {
    commits: 0,
    pullRequests: 0,
    issues: 0,
    stars: 0,
    repositories: 0
  };

  return {
    score: user.score,
    lastUpdated: user.lastUpdated,
    breakdown: computeScore(stats)
  };
}

async function getStoredGitHubToken(userId: string) {
  const account = await prisma.gitHubAccount.findUnique({
    where: { userId },
    select: {
      accessTokenEncrypted: true,
      accessTokenIv: true,
      accessTokenTag: true
    }
  });

  if (!account) {
    throw new ApiError("UNAUTHORIZED", "GitHub account is not linked");
  }

  return decryptSecret(account.accessTokenEncrypted, account.accessTokenIv, account.accessTokenTag);
}

async function assertTokenBelongsToUser(userId: string, githubId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubId: true }
  });

  if (!user) {
    throw new ApiError("NOT_FOUND", "User not found");
  }

  if (user.githubId !== githubId) {
    throw new ApiError("FORBIDDEN", "GitHub token does not belong to this user");
  }
}

async function persistAggregate(userId: string, aggregate: GitHubAggregateResult) {
  const score = computeScore(aggregate.stats);

  const user = await prisma.$transaction(async (tx) =>
    tx.user.update({
      where: { id: userId },
      data: {
        githubUsername: aggregate.profile.githubUsername,
        githubId: aggregate.profile.githubId,
        avatarUrl: aggregate.profile.avatarUrl,
        score: score.score,
        lastUpdated: new Date(),
        stats: {
          upsert: {
            create: aggregate.stats,
            update: aggregate.stats
          }
        }
      },
      select: userSelect
    })
  );

  return {
    user,
    score,
    warnings: aggregate.warnings
  };
}

export async function validateStoredGitHubToken(userId: string) {
  const token = await getStoredGitHubToken(userId);
  const profile = await fetchGitHubProfile(token);
  await assertTokenBelongsToUser(userId, profile.githubId);
  return profile;
}
