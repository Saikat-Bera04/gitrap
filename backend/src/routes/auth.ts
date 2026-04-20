import { Router } from "express";
import { z } from "zod";
import { createSessionToken } from "../lib/auth.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { walletAddressSchema } from "../lib/validation.js";
import { authenticateWithGitHubCode } from "../lib/users.js";

const router = Router();

const githubCallbackSchema = z.object({
  code: z.string().trim().min(1),
  walletAddress: walletAddressSchema
});

router.post(
  "/github",
  asyncHandler(async (req, res) => {
    const body = githubCallbackSchema.parse(req.body);
    const result = await authenticateWithGitHubCode(body.code, body.walletAddress);
    const token = createSessionToken({
      userId: result.user.id,
      walletAddress: result.user.walletAddress
    });

    return sendOk(
      res,
      {
        token,
        user: result.user,
        score: result.score,
        warnings: result.warnings
      },
      201
    );
  })
);

export default router;
