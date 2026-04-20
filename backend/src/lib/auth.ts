import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { ApiError } from "./http.js";
import { requireEnv } from "./env.js";

const tokenSchema = z.object({
  sub: z.string(),
  walletAddress: z.string()
});

export type AuthContext = {
  userId: string;
  walletAddress: string;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export function createSessionToken(payload: AuthContext) {
  return jwt.sign(
    {
      sub: payload.userId,
      walletAddress: payload.walletAddress
    },
    requireEnv("JWT_SECRET"),
    { expiresIn: "7d", issuer: "gitrap-api" }
  );
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Missing bearer token");
    }

    const verified = jwt.verify(token, requireEnv("JWT_SECRET"), {
      issuer: "gitrap-api"
    });
    const parsed = tokenSchema.parse(verified);

    const user = await prisma.user.findUnique({
      where: { id: parsed.sub },
      select: { id: true, walletAddress: true }
    });

    if (!user || user.walletAddress !== parsed.walletAddress) {
      throw new ApiError("UNAUTHORIZED", "Invalid session");
    }

    (req as AuthenticatedRequest).auth = {
      userId: user.id,
      walletAddress: user.walletAddress
    };

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError("UNAUTHORIZED", "Invalid bearer token"));
  }
}

export function getAuth(req: Request) {
  const auth = (req as AuthenticatedRequest).auth;

  if (!auth) {
    throw new ApiError("UNAUTHORIZED", "Authentication context missing");
  }

  return auth;
}
