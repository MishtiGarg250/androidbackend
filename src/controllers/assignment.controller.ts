import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

const parseAssignmentId = (value: string | string[]): number | null => {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getAccessibleAssignment = async (userId: number, assignmentId: number) =>
  prisma.assignment.findFirst({
    where: { id: assignmentId, course: { enrollments: { some: { userId } } } },
    select: { id: true, title: true, description: true, duedate: true, courseId: true },
  });

const withProgress = async (userId: number, assignments: { id: number; title: string; description: string | null; duedate: Date; courseId: number }[]) => {
  const [courses, progress] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: assignments.map((assignment) => assignment.courseId) } }, select: { id: true, name: true, code: true } }),
    prisma.assignmentProgress.findMany({ where: { userId, assignmentId: { in: assignments.map((assignment) => assignment.id) } }, select: { assignmentId: true, completed: true } }),
  ]);
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const progressByAssignmentId = new Map(progress.map((item) => [item.assignmentId, item.completed]));
  return assignments.flatMap((assignment) => {
    const course = courseById.get(assignment.courseId);
    return course ? [{ id: assignment.id, title: assignment.title, description: assignment.description, duedate: assignment.duedate, course, completed: progressByAssignmentId.get(assignment.id) ?? false }] : [];
  });
};

export const getAssignments = async (req: Request, res: Response) => {
  const assignments = await prisma.assignment.findMany({
    where: { course: { enrollments: { some: { userId: req.userId! } } } },
    select: { id: true, title: true, description: true, duedate: true, courseId: true },
    orderBy: { duedate: "asc" },
  });
  return res.json({ success: true, data: await withProgress(req.userId!, assignments) });
};

export const getAssignmentById = async (req: Request, res: Response) => {
  const id = parseAssignmentId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid assignment ID" });
  const assignment = await getAccessibleAssignment(req.userId!, id);
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found or you are not enrolled in this course" });
  const [result] = await withProgress(req.userId!, [assignment]);
  return res.json({ success: true, data: result });
};

const setAssignmentCompletion = async (req: Request, res: Response, completed: boolean) => {
  const assignmentId = parseAssignmentId(req.params.id);
  if (!assignmentId) return res.status(400).json({ success: false, message: "Invalid assignment ID" });
  const assignment = await getAccessibleAssignment(req.userId!, assignmentId);
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found or you are not enrolled in this course" });

  const progress = await prisma.assignmentProgress.upsert({
    where: { userId_assignmentId: { userId: req.userId!, assignmentId } },
    create: { userId: req.userId!, assignmentId, completed, completedAt: completed ? new Date() : null },
    update: { completed, completedAt: completed ? new Date() : null },
    select: { id: true, assignmentId: true, completed: true, completedAt: true },
  });
  return res.json({ success: true, message: completed ? "Assignment marked as completed" : "Assignment marked as incomplete", data: progress });
};

export const completeAssignment = (req: Request, res: Response) => setAssignmentCompletion(req, res, true);
export const incompleteAssignment = (req: Request, res: Response) => setAssignmentCompletion(req, res, false);
