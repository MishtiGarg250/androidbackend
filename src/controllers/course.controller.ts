import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

const parseCourseId = (value: string | string[]): number | null => {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

interface AcademicContext {
  branch: string;
  semester: number;
}

const getStudentContext = async (userId: number): Promise<AcademicContext | "missing-academic-profile" | null> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { branch: true, semester: true } });
  if (!user) return null;
  if (!user.branch || !user.semester) return "missing-academic-profile" as const;
  return { branch: user.branch, semester: user.semester };
};

export const getCourses = async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { enrollments: { some: { userId: req.userId! } } },
    select: { id: true, name: true, code: true, teacher: true },
    orderBy: { code: "asc" },
  });
  return res.json({ success: true, data: courses.map((course) => ({ ...course, enrolled: true })) });
};

export const getAvailableCourses = async (req: Request, res: Response) => {
  const context = await getStudentContext(req.userId!);
  if (!context) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (context === "missing-academic-profile") return res.status(400).json({ success: false, message: "Complete your branch and semester in your profile first" });

  const offerings = await prisma.courseOffering.findMany({
    where: { branch: context.branch, semester: context.semester },
    select: { courseId: true, isRequired: true },
  });
  const courses = await prisma.course.findMany({
    where: { id: { in: offerings.map((offering) => offering.courseId) } },
    select: { id: true, name: true, code: true, teacher: true, enrollments: { where: { userId: req.userId! }, select: { id: true } } },
    orderBy: { code: "asc" },
  });
  const requiredByCourseId = new Map(offerings.map((offering) => [offering.courseId, offering.isRequired]));
  return res.json({
    success: true,
    data: courses.map((course) => ({
      id: course.id, name: course.name, code: course.code, teacher: course.teacher, isRequired: requiredByCourseId.get(course.id) ?? false, enrolled: course.enrollments.length > 0,
    })),
  });
};

export const getCourseById = async (req: Request, res: Response) => {
  const id = parseCourseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid course ID" });
  const course = await prisma.course.findFirst({
    where: { id, enrollments: { some: { userId: req.userId! } } },
    select: { id: true, name: true, code: true, teacher: true },
  });
  if (!course) return res.status(404).json({ success: false, message: "Course not found or you are not enrolled" });
  return res.json({ success: true, data: course });
};

export const enrollInCourse = async (req: Request, res: Response) => {
  const courseId = parseCourseId(req.params.id);
  if (!courseId) return res.status(400).json({ success: false, message: "Invalid course ID" });
  const context = await getStudentContext(req.userId!);
  if (!context) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (context === "missing-academic-profile") return res.status(400).json({ success: false, message: "Complete your branch and semester in your profile first" });

  const offering = await prisma.courseOffering.findUnique({
    where: { courseId_branch_semester: { courseId, branch: context.branch, semester: context.semester } },
    select: { courseId: true },
  });
  if (!offering) return res.status(403).json({ success: false, message: "This course is not available for your branch and semester" });
  const course = await prisma.course.findUnique({
    where: { id: offering.courseId },
    select: { id: true, name: true, code: true, teacher: true },
  });
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  try {
    await prisma.enrollment.create({ data: { userId: req.userId!, courseId } });
    return res.status(201).json({ success: true, message: "Enrolled in course successfully", data: course });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ success: false, message: "You are already enrolled in this course" });
    }
    throw error;
  }
};

export const unenrollFromCourse = async (req: Request, res: Response) => {
  const courseId = parseCourseId(req.params.id);
  if (!courseId) return res.status(400).json({ success: false, message: "Invalid course ID" });
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.userId!, courseId } }, select: { id: true } });
  if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
  await prisma.enrollment.delete({ where: { id: enrollment.id } });
  return res.json({ success: true, message: "Unenrolled from course successfully", data: null });
};
