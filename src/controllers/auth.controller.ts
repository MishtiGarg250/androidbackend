import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";
import { generateToken } from "../lib/jwt.js";

const userSelect = { id: true, name: true, email: true, rollNo: true, branch: true, semester: true, role: true, createdAt: true } as const;

export const register = async (req: Request, res: Response) => {
  const { name, email, password, rollNo, branch, semester } = req.body as Record<string, unknown>;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const parsedSemester = Number(semester);
  if (typeof name !== "string" || !name.trim() || !normalizedEmail || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ success: false, message: "Name, valid email, and a password of at least 8 characters are required" });
  }
  if (typeof rollNo !== "string" || !rollNo.trim() || typeof branch !== "string" || !branch.trim() || !Number.isInteger(parsedSemester) || parsedSemester < 1) {
    return res.status(400).json({ success: false, message: "rollNo, branch, and a positive integer semester are required for students" });
  }
  try {
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), rollNo: rollNo.trim(), branch: branch.trim(), semester: parsedSemester },
      select: userSelect,
    });
    return res.status(201).json({ success: true, message: "User registered successfully", data: { token: generateToken(user.id), user } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Email or roll number is already registered" });
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  const { password: _password, ...safeUser } = user;
  return res.json({ success: true, data: { token: generateToken(user.id), user: safeUser } });
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: userSelect });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, data: user });
};
