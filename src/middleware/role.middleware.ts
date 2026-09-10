import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

export const requireRoles = (...allowedRoles: UserRole[]) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userId === undefined) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
