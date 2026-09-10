import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { createAssignment, deleteAssignment, recordAttendance, updateAssignment } from "./admin.controller.js";

const canManageCourse = async (facultyId: number, courseId: number) => Boolean(await prisma.facultyCourse.findUnique({ where: { facultyId_courseId: { facultyId, courseId } } }));

export const facultyCreateAssignment = async (req: Request, res: Response) => {
  const courseId = Number((req.body as Record<string, unknown>).courseId);
  if (!Number.isInteger(courseId) || !(await canManageCourse(req.userId!, courseId))) return res.status(403).json({ success: false, message: "You are not assigned to this course" });
  return createAssignment(req, res);
};
export const facultyUpdateAssignment = async (req: Request, res: Response) => {
  const assignmentId = Number(req.params.id); const assignment = Number.isInteger(assignmentId) ? await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { courseId: true } }) : null;
  if (!assignment || !(await canManageCourse(req.userId!, assignment.courseId))) return res.status(403).json({ success: false, message: "You are not assigned to this course" });
  return updateAssignment(req, res);
};
export const facultyDeleteAssignment = async (req: Request, res: Response) => {
  const assignmentId = Number(req.params.id); const assignment = Number.isInteger(assignmentId) ? await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { courseId: true } }) : null;
  if (!assignment || !(await canManageCourse(req.userId!, assignment.courseId))) return res.status(403).json({ success: false, message: "You are not assigned to this course" });
  return deleteAssignment(req, res);
};
export const facultyRecordAttendance = async (req: Request, res: Response) => {
  const courseId = Number((req.body as Record<string, unknown>).courseId);
  if (!Number.isInteger(courseId) || !(await canManageCourse(req.userId!, courseId))) return res.status(403).json({ success: false, message: "You are not assigned to this course" });
  return recordAttendance(req, res);
};
