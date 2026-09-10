import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

interface AcademicContext { branch: string; semester: number; }

const getAcademicContext = async (userId: number): Promise<AcademicContext | null> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { branch: true, semester: true } });
  if (!user?.branch || !user.semester) return null;
  return { branch: user.branch, semester: user.semester };
};

const getTimetable = async (userId: number, dayOfWeek?: number) => {
  const context = await getAcademicContext(userId);
  if (!context) return null;
  const offerings = await prisma.courseOffering.findMany({
    where: { branch: context.branch, semester: context.semester },
    select: { id: true, courseId: true },
  });
  const entries = await prisma.timetableEntry.findMany({
    where: { courseOfferingId: { in: offerings.map((offering) => offering.id) }, ...(dayOfWeek ? { dayOfWeek } : {}) },
    select: { id: true, courseOfferingId: true, dayOfWeek: true, startTime: true, endTime: true, room: true, type: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  const courseIdByOfferingId = new Map(offerings.map((offering) => [offering.id, offering.courseId]));
  const courses = await prisma.course.findMany({
    where: { id: { in: offerings.map((offering) => offering.courseId) } },
    select: { id: true, name: true, code: true, teacher: true },
  });
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  return entries.flatMap((entry) => {
    const course = coursesById.get(courseIdByOfferingId.get(entry.courseOfferingId)!);
    return course ? [{ ...entry, course }] : [];
  });
};

const currentDayOfWeek = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
};

const currentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const getTimetableEntries = async (req: Request, res: Response) => {
  const entries = await getTimetable(req.userId!);
  if (!entries) return res.status(400).json({ success: false, message: "Complete your branch and semester in your profile first" });
  return res.json({ success: true, data: entries });
};

export const getTodayTimetable = async (req: Request, res: Response) => {
  const entries = await getTimetable(req.userId!, currentDayOfWeek());
  if (!entries) return res.status(400).json({ success: false, message: "Complete your branch and semester in your profile first" });
  return res.json({ success: true, data: entries });
};

export const getNextClass = async (req: Request, res: Response) => {
  const entries = await getTimetable(req.userId!, currentDayOfWeek());
  if (!entries) return res.status(400).json({ success: false, message: "Complete your branch and semester in your profile first" });
  const nextClass = entries.find((entry) => entry.startTime >= currentTime()) ?? null;
  return res.json({ success: true, data: nextClass });
};
