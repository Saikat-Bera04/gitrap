import { Router } from "express";
import { z } from "zod";
import { getAuth, requireAuth } from "../lib/auth.js";
import {
  createGitHubIssue,
  listGitHubIssues,
  listGitHubRepositories,
  updateGitHubIssue
} from "../lib/github.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { getStoredGitHubToken } from "../lib/users.js";

const router = Router();

const repoPathSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Repository must be owner/repo");

const issueSchema = z.object({
  repo: repoPathSchema,
  title: z.string().trim().min(3).max(256),
  body: z.string().trim().max(65536).optional(),
  labels: z.array(z.string().trim().min(1).max(50)).max(10).optional()
});

const updateIssueSchema = issueSchema
  .partial()
  .extend({
    repo: repoPathSchema,
    issueNumber: z.coerce.number().int().positive(),
    state: z.enum(["open", "closed"]).optional()
  })
  .refine((value) => value.title || value.body || value.state || value.labels, {
    message: "At least one issue field must be updated"
  });

function splitRepo(repo: string) {
  const [owner, name] = repo.split("/");
  return { owner, repo: name };
}

router.get(
  "/site-issues",
  asyncHandler(async (_req, res) => {
    const issues = await prisma.siteIssue.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        repoFullName: true,
        githubIssueId: true,
        githubIssueNumber: true,
        title: true,
        body: true,
        state: true,
        url: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            githubUsername: true,
            walletAddress: true,
            avatarUrl: true,
            score: true
          }
        }
      }
    });

    return sendOk(res, issues);
  })
);

router.use(requireAuth);

router.get(
  "/repos",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const token = await getStoredGitHubToken(auth.userId);
    return sendOk(res, await listGitHubRepositories(token));
  })
);

router.get(
  "/issues",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const token = await getStoredGitHubToken(auth.userId);
    return sendOk(res, await listGitHubIssues(token));
  })
);

router.post(
  "/issues",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    
    try {
      const body = issueSchema.parse(req.body);
      const token = await getStoredGitHubToken(auth.userId);
      const repo = splitRepo(body.repo);

      console.log(`[GitHub] Creating issue for user ${auth.userId} in ${body.repo}`);

      const issue = await createGitHubIssue(token, {
        owner: repo.owner,
        repo: repo.repo,
        title: body.title,
        body: body.body,
        labels: body.labels
      });

      console.log(`[GitHub] Issue created: ${issue.number} in ${body.repo}`);

      await prisma.siteIssue.upsert({
        where: { githubIssueId: issue.id },
        create: {
          createdById: auth.userId,
          repoFullName: body.repo,
          githubIssueId: issue.id,
          githubIssueNumber: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          url: issue.url
        },
        update: {
          title: issue.title,
          body: issue.body,
          state: issue.state,
          url: issue.url
        }
      });

      return sendOk(res, issue, 201);
    } catch (error) {
      console.error(`[GitHub] Error creating issue:`, error);
      throw error;
    }
  })
);

router.patch(
  "/issues",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    
    try {
      const body = updateIssueSchema.parse(req.body);
      const token = await getStoredGitHubToken(auth.userId);
      const repo = splitRepo(body.repo);

      console.log(`[GitHub] Updating issue #${body.issueNumber} in ${body.repo}`);

      const issue = await updateGitHubIssue(token, {
        owner: repo.owner,
        repo: repo.repo,
        issueNumber: body.issueNumber,
        title: body.title,
        body: body.body,
        state: body.state,
        labels: body.labels
      });

      await prisma.siteIssue.updateMany({
        where: {
          repoFullName: body.repo,
          githubIssueNumber: body.issueNumber
        },
        data: {
          title: issue.title,
          body: issue.body,
          state: issue.state,
          url: issue.url
        }
      });

      return sendOk(res, issue);
    } catch (error) {
      console.error(`[GitHub] Error updating issue:`, error);
      throw error;
    }
  })
);

export default router;
