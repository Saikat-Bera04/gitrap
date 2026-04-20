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
    const body = issueSchema.parse(req.body);
    const token = await getStoredGitHubToken(auth.userId);
    const repo = splitRepo(body.repo);

    return sendOk(
      res,
      await createGitHubIssue(token, {
        owner: repo.owner,
        repo: repo.repo,
        title: body.title,
        body: body.body,
        labels: body.labels
      }),
      201
    );
  })
);

router.patch(
  "/issues",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const body = updateIssueSchema.parse(req.body);
    const token = await getStoredGitHubToken(auth.userId);
    const repo = splitRepo(body.repo);

    return sendOk(
      res,
      await updateGitHubIssue(token, {
        owner: repo.owner,
        repo: repo.repo,
        issueNumber: body.issueNumber,
        title: body.title,
        body: body.body,
        state: body.state,
        labels: body.labels
      })
    );
  })
);

export default router;
