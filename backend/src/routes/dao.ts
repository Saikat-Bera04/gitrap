import { Router } from "express";
import { z } from "zod";
import { getAuth, requireAuth } from "../lib/auth.js";
import { asyncHandler, sendOk, ApiError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { walletAddressSchema } from "../lib/validation.js";

const router = Router();

const voteSchema = z.object({
  daoName: z.string().trim().min(2).max(100),
  verdict: z.enum(["verified", "not_verified"]),
  walletAddress: walletAddressSchema
});

router.get(
  "/votes",
  asyncHandler(async (_req, res) => {
    try {
      const rows = await prisma.daoVote.groupBy({
        by: ["daoName", "verdict"],
        _count: { _all: true }
      });

      const votes = rows.reduce<Record<string, { verified: number; notVerified: number }>>((acc, row) => {
        acc[row.daoName] ??= { verified: 0, notVerified: 0 };
        if (row.verdict === "verified") acc[row.daoName].verified = row._count._all;
        if (row.verdict === "not_verified") acc[row.daoName].notVerified = row._count._all;
        return acc;
      }, {});

      return sendOk(res, votes);
    } catch (error) {
      console.error("[DAO] Error fetching votes:", error);
      throw error;
    }
  })
);

router.post(
  "/votes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    
    try {
      const body = voteSchema.parse(req.body);

      console.log(`[DAO] Recording vote from ${auth.userId} on ${body.daoName}: ${body.verdict}`);

      const vote = await prisma.daoVote.upsert({
        where: {
          userId_daoName: {
            userId: auth.userId,
            daoName: body.daoName
          }
        },
        create: {
          userId: auth.userId,
          daoName: body.daoName,
          verdict: body.verdict,
          walletAddress: body.walletAddress
        },
        update: {
          verdict: body.verdict,
          walletAddress: body.walletAddress
        }
      });

      return sendOk(res, vote, 201);
    } catch (error) {
      console.error("[DAO] Error recording vote:", error);
      throw error;
    }
  })
);

export default router;
