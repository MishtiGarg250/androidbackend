import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

export type AuthenticatedRequest = Request;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Invalid authorization format" });
  }
  try {
    req.userId = verifyToken(token).userId;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
