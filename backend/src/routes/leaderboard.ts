import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { paginationSchema } from "../lib/validation.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, page } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          walletAddress: true,
          githubUsername: true,
          avatarUrl: true,
          score: true,
          lastUpdated: true,
          stats: {
            select: {
              commits: true,
              pullRequests: true,
              issues: true,
              stars: true,
              repositories: true,
              updatedAt: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    return sendOk(res, {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

export default router;
