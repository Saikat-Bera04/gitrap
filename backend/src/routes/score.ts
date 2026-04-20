import { Router } from "express";
import { z } from "zod";
import { getAuth, requireAuth } from "../lib/auth.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { walletAddressSchema } from "../lib/validation.js";
import { getScore } from "../lib/users.js";

const router = Router();

const syncSchema = z.object({
  chainId: z.coerce.number().int().positive(),
  contractAddress: walletAddressSchema,
  transactionHash: z.string().trim().regex(/^0x[a-fA-F0-9]{64}$/).optional()
});

router.post(
  "/sync",
  requireAuth,
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const body = syncSchema.parse(req.body);
    const score = await getScore(auth.userId);

    return sendOk(res, {
      status: body.transactionHash ? "recorded" : "prepared",
      chainId: body.chainId,
      contractAddress: body.contractAddress,
      transactionHash: body.transactionHash,
      walletAddress: auth.walletAddress,
      score: score.score,
      syncedAt: body.transactionHash ? new Date().toISOString() : undefined,
      contractCall: {
        functionName: "syncScore",
        args: [auth.walletAddress, score.score]
      }
    });
  })
);

export default router;
