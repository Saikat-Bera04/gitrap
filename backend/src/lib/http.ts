import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = statusByCode[code];
    this.details = details;
  }
}

export function asyncHandler<TReq extends Request = Request>(
  handler: (req: TReq, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: TReq, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function sendOk<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError("NOT_FOUND", "Route not found"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid request payload",
        details: error.flatten()
      }
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error("[ERROR]", {
    message: errorMessage,
    stack: errorStack,
    error
  });
  
  return res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" ? errorMessage : "Unexpected server error",
      details: process.env.NODE_ENV === "development" ? { stack: errorStack } : undefined
    }
  });
}
