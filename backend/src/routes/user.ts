import { Router } from "express";
import { z } from "zod";
import { getAuth, requireAuth } from "../lib/auth.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { getProfile, getScore, isCacheFresh, refreshUserStats } from "../lib/users.js";

const router = Router();

const refreshSchema = z.object({
  force: z.boolean().default(false)
});

router.use(requireAuth);

router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    return sendOk(res, await getProfile(auth.userId));
  })
);

router.get(
  "/score",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    return sendOk(res, await getScore(auth.userId));
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const body = refreshSchema.parse(req.body ?? {});
    const current = await getProfile(auth.userId);

    if (!body.force && isCacheFresh(current.lastUpdated)) {
      return sendOk(res, {
        user: current,
        score: await getScore(auth.userId),
        cached: true,
        cacheTtl: "GitHub data is refreshed at most once per cache window unless force=true."
      });
    }

    const refreshed = await refreshUserStats(auth.userId);
    return sendOk(res, {
      ...refreshed,
      cached: false
    });
  })
);

export default router;
