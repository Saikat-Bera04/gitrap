import { Router } from "express";
import { getAuth, requireAuth } from "../lib/auth.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { computeScore } from "../lib/scoring.js";
import { getProfile } from "../lib/users.js";

const router = Router();

router.post(
  "/metadata",
  requireAuth,
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const user = await getProfile(auth.userId);
    const stats = user.stats ?? {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      stars: 0,
      repositories: 0
    };
    const breakdown = computeScore(stats);

    return sendOk(res, {
      name: `gitrap Reputation - ${user.githubUsername}`,
      description: "A verifiable developer reputation credential generated from GitHub activity.",
      image: user.avatarUrl,
      external_url: `https://github.com/${user.githubUsername}`,
      attributes: [
        { trait_type: "Score", value: user.score },
        { trait_type: "Commits", value: stats.commits },
        { trait_type: "Merged Pull Requests", value: stats.pullRequests },
        { trait_type: "Issues", value: stats.issues },
        { trait_type: "Stars Received", value: stats.stars },
        { trait_type: "Repositories", value: stats.repositories },
        { trait_type: "Normalized Score", value: breakdown.score },
        { trait_type: "Wallet", value: user.walletAddress }
      ]
    });
  })
);

export default router;
