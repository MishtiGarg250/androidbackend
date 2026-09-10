import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  rollNo: true,
  branch: true,
  semester: true,
  role: true,
  createdAt: true,
} as const;

export const getMyProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: profileSelect,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({ success: true, data: user });
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const { name, rollNo, branch, semester } = req.body as Record<string, unknown>;

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ success: false, message: "Name must be a non-empty string" });
  }
  if (rollNo !== undefined && rollNo !== null && typeof rollNo !== "string") {
    return res.status(400).json({ success: false, message: "rollNo must be a string or null" });
  }
  if (branch !== undefined && branch !== null && typeof branch !== "string") {
    return res.status(400).json({ success: false, message: "branch must be a string or null" });
  }

  const parsedSemester = semester === undefined || semester === null ? semester : Number(semester);
  if (parsedSemester !== undefined && parsedSemester !== null && (!Number.isInteger(parsedSemester) || parsedSemester < 1)) {
    return res.status(400).json({ success: false, message: "semester must be a positive integer or null" });
  }

  if (name === undefined && rollNo === undefined && branch === undefined && semester === undefined) {
    return res.status(400).json({ success: false, message: "Provide at least one profile field to update" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(name !== undefined ? { name: name.trim() as string } : {}),
        ...(rollNo !== undefined ? { rollNo: rollNo === null ? null : (rollNo as string).trim() } : {}),
        ...(branch !== undefined ? { branch: branch === null ? null : (branch as string).trim() } : {}),
        ...(semester !== undefined ? { semester: parsedSemester as number | null } : {}),
      },
      select: profileSelect,
    });

    return res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code === "P2002") {
      return res.status(409).json({ success: false, message: "Email or roll number is already in use" });
    }
    throw error;
  }
};
