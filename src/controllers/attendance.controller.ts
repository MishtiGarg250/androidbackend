import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

const parseCourseId = (value: string | string[]): number | null => {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const attendanceWithCourse = async (userId: number, courseId?: number) => {
  const records = await prisma.attendance.findMany({
    where: { userId, ...(courseId ? { courseId } : {}) },
    select: { id: true, courseId: true, present: true, date: true },
    orderBy: { date: "desc" },
  });
  const courses = await prisma.course.findMany({
    where: { id: { in: [...new Set(records.map((record) => record.courseId))] } },
    select: { id: true, name: true, code: true },
  });
  const courseById = new Map(courses.map((course) => [course.id, course]));
  return records.flatMap((record) => {
    const course = courseById.get(record.courseId);
    return course ? [{ ...record, course }] : [];
  });
};

export const getAttendance = async (req: Request, res: Response) =>
  res.json({ success: true, data: await attendanceWithCourse(req.userId!) });

export const getCourseAttendance = async (req: Request, res: Response) => {
  const courseId = parseCourseId(req.params.courseId);
  if (!courseId) return res.status(400).json({ success: false, message: "Invalid course ID" });
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.userId!, courseId } } });
  if (!enrollment) return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
  return res.json({ success: true, data: await attendanceWithCourse(req.userId!, courseId) });
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.userId! },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  const [courses, records] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, name: true, code: true } }),
    prisma.attendance.findMany({ where: { userId: req.userId!, courseId: { in: courseIds } }, select: { courseId: true, present: true } }),
  ]);
  const coursesSummary = courses.map((course) => {
    const courseRecords = records.filter((record) => record.courseId === course.id);
    const total = courseRecords.length;
    const present = courseRecords.filter((record) => record.present).length;
    return { courseId: course.id, courseName: course.name, courseCode: course.code, present, total, percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0 };
  });
  const classesConducted = records.length;
  const classesAttended = records.filter((record) => record.present).length;
  return res.json({
    success: true,
    data: { overallPercentage: classesConducted ? Number(((classesAttended / classesConducted) * 100).toFixed(2)) : 0, courses: coursesSummary },
  });
};
