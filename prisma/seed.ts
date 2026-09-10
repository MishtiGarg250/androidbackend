import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not defined");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const password = await bcrypt.hash("CampusHub123!", 12);
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "admin@campushub.dev" }, update: { name: "Asha Admin", password, role: UserRole.ADMIN }, create: { name: "Asha Admin", email: "admin@campushub.dev", password, role: UserRole.ADMIN } }),
    prisma.user.upsert({ where: { email: "faculty@campushub.dev" }, update: { name: "Dr. Priya Sharma", password, role: UserRole.FACULTY }, create: { name: "Dr. Priya Sharma", email: "faculty@campushub.dev", password, role: UserRole.FACULTY } }),
    prisma.user.upsert({ where: { email: "arjun.ece@campushub.dev" }, update: { name: "Arjun Mehta", password, rollNo: "ECE23017", branch: "ECE", semester: 3, role: UserRole.STUDENT }, create: { name: "Arjun Mehta", email: "arjun.ece@campushub.dev", password, rollNo: "ECE23017", branch: "ECE", semester: 3, role: UserRole.STUDENT } }),
    prisma.user.upsert({ where: { email: "neha.cse@campushub.dev" }, update: { name: "Neha Verma", password, rollNo: "CSE24008", branch: "CSE", semester: 4, role: UserRole.STUDENT }, create: { name: "Neha Verma", email: "neha.cse@campushub.dev", password, rollNo: "CSE24008", branch: "CSE", semester: 4, role: UserRole.STUDENT } }),
  ]);
  const [admin, faculty, ece, cse] = users;
  const definitions = [["Data Structures", "CS201", "Dr. Priya Sharma"], ["Digital Electronics", "EC201", "Dr. Rakesh Nair"], ["Signals & Systems", "EC202", "Dr. Kavita Rao"], ["Database Management Systems", "CS301", "Dr. Priya Sharma"], ["Operating Systems", "CS302", "Dr. Anil Kapoor"], ["Mathematics", "MA201", "Dr. Meera Iyer"]] as const;
  const courses = await Promise.all(definitions.map(([name, code, teacher]) => prisma.course.upsert({ where: { code }, update: { name, teacher }, create: { name, code, teacher } })));
  const course = new Map(courses.map((item) => [item.code, item]));
  const ids = courses.map((item) => item.id);

  // Refresh only relations for these demo users and courses.
  await prisma.assignmentProgress.deleteMany({ where: { assignment: { courseId: { in: ids } } } });
  await prisma.assignment.deleteMany({ where: { courseId: { in: ids } } });
  await prisma.attendance.deleteMany({ where: { userId: { in: [ece.id, cse.id] }, courseId: { in: ids } } });
  await prisma.enrollment.deleteMany({ where: { userId: { in: [ece.id, cse.id] }, courseId: { in: ids } } });
  await prisma.facultyCourse.deleteMany({ where: { facultyId: faculty.id, courseId: { in: ids } } });
  await prisma.courseOffering.deleteMany({ where: { courseId: { in: ids } } });

  const offeringDefinitions: Array<[string, string, number]> = [
    ["CS201", "ECE", 3], ["EC201", "ECE", 3], ["EC202", "ECE", 3], ["MA201", "ECE", 3], ["CS301", "CSE", 4], ["CS302", "CSE", 4], ["MA201", "CSE", 4],
  ];
  const offerings = await Promise.all(offeringDefinitions.map(([code, branch, semester]) => prisma.courseOffering.create({ data: { courseId: course.get(code)!.id, branch, semester } })));
  const offering = new Map(offerings.map((item) => [item.courseId, item.id]));
  await prisma.timetableEntry.createMany({ data: [
    { courseOfferingId: offering.get(course.get("CS201")!.id)!, dayOfWeek: 1, startTime: "09:00", endTime: "10:00", room: "A-105", type: "Lecture" },
    { courseOfferingId: offering.get(course.get("EC201")!.id)!, dayOfWeek: 1, startTime: "10:00", endTime: "11:00", room: "C-204", type: "Lecture" },
    { courseOfferingId: offering.get(course.get("EC202")!.id)!, dayOfWeek: 3, startTime: "11:00", endTime: "12:00", room: "C-201", type: "Tutorial" },
    { courseOfferingId: offering.get(course.get("CS301")!.id)!, dayOfWeek: 2, startTime: "09:00", endTime: "10:00", room: "B-110", type: "Lecture" },
    { courseOfferingId: offering.get(course.get("CS302")!.id)!, dayOfWeek: 4, startTime: "10:00", endTime: "11:00", room: "B-111", type: "Lecture" },
  ] });
  await prisma.enrollment.createMany({ data: [...["CS201", "EC201", "EC202", "MA201"].map((code) => ({ userId: ece.id, courseId: course.get(code)!.id })), ...["CS301", "CS302", "MA201"].map((code) => ({ userId: cse.id, courseId: course.get(code)!.id }))] });
  await prisma.facultyCourse.createMany({ data: [{ facultyId: faculty.id, courseId: course.get("CS201")!.id }, { facultyId: faculty.id, courseId: course.get("CS301")!.id }] });
  const [dsAssignment] = await Promise.all([
    prisma.assignment.create({ data: { courseId: course.get("CS201")!.id, title: "Binary Search Tree", description: "Implement insertion, deletion, and traversal.", duedate: new Date("2026-10-15T23:59:00Z") } }),
    prisma.assignment.create({ data: { courseId: course.get("EC201")!.id, title: "Logic Design Worksheet", description: "Complete Karnaugh-map exercises.", duedate: new Date("2026-10-18T23:59:00Z") } }),
    prisma.assignment.create({ data: { courseId: course.get("CS301")!.id, title: "Normalization Exercise", description: "Normalize the supplied schema to 3NF.", duedate: new Date("2026-10-20T23:59:00Z") } }),
  ]);
  await prisma.assignmentProgress.create({ data: { userId: ece.id, assignmentId: dsAssignment.id, completed: true, completedAt: new Date("2026-10-01T12:00:00Z") } });
  await prisma.attendance.createMany({ data: [
    { userId: ece.id, courseId: course.get("CS201")!.id, present: true, date: new Date("2026-09-01") }, { userId: ece.id, courseId: course.get("CS201")!.id, present: true, date: new Date("2026-09-08") }, { userId: ece.id, courseId: course.get("EC201")!.id, present: false, date: new Date("2026-09-01") }, { userId: ece.id, courseId: course.get("EC201")!.id, present: true, date: new Date("2026-09-08") }, { userId: cse.id, courseId: course.get("CS301")!.id, present: true, date: new Date("2026-09-02") }, { userId: cse.id, courseId: course.get("CS302")!.id, present: true, date: new Date("2026-09-04") },
  ] });
  console.log(`Seeded ${admin.email}; demo password: CampusHub123!`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
