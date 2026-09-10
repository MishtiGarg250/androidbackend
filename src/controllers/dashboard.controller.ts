import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

const todayDayOfWeek = () => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
};

export const getDashboard = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { id: true, name: true, email: true, branch: true, semester: true } });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const enrollments = await prisma.enrollment.findMany({ where: { userId: req.userId! }, select: { courseId: true } });
  const courseIds = enrollments.map((item) => item.courseId);
  const [courses, assignments, attendance, offerings] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, name: true, code: true, teacher: true } }),
    prisma.assignment.findMany({ where: { courseId: { in: courseIds }, duedate: { gte: new Date() } }, select: { id: true, courseId: true, title: true, description: true, duedate: true }, orderBy: { duedate: "asc" }, take: 5 }),
    prisma.attendance.findMany({ where: { userId: req.userId!, courseId: { in: courseIds } }, select: { present: true } }),
    user.branch && user.semester ? prisma.courseOffering.findMany({ where: { branch: user.branch, semester: user.semester }, select: { id: true, courseId: true } }) : Promise.resolve([]),
  ]);
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const offeringIdToCourseId = new Map(offerings.map((offering) => [offering.id, offering.courseId]));
  const todayEntries = await prisma.timetableEntry.findMany({ where: { courseOfferingId: { in: offerings.map((offering) => offering.id) }, dayOfWeek: todayDayOfWeek() }, select: { id: true, courseOfferingId: true, dayOfWeek: true, startTime: true, endTime: true, room: true, type: true }, orderBy: { startTime: "asc" } });
  const classesConducted = attendance.length;
  const classesAttended = attendance.filter((item) => item.present).length;
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      todayClasses: todayEntries.flatMap((entry) => { const course = courseById.get(offeringIdToCourseId.get(entry.courseOfferingId)!); return course ? [{ ...entry, course }] : []; }),
      upcomingAssignments: assignments.flatMap((assignment) => { const course = courseById.get(assignment.courseId); return course ? [{ ...assignment, course: { id: course.id, name: course.name, code: course.code } }] : []; }),
      attendance: { overallPercentage: classesConducted ? Number(((classesAttended / classesConducted) * 100).toFixed(2)) : 0, classesAttended, classesConducted },
    },
  });
};
