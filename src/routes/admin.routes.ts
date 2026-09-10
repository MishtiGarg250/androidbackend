import { Router } from "express";
import { assignFacultyToCourse, createAssignment, createCourse, createCourseOffering, createEnrollment, createTimetableEntry, deleteAssignment, deleteCourse, deleteCourseOffering, deleteEnrollment, deleteTimetableEntry, recordAttendance, removeFacultyFromCourse, updateAssignment, updateCourse, updateCourseOffering, updateTimetableEntry } from "../controllers/admin.controller.js";
import { facultyCreateAssignment, facultyDeleteAssignment, facultyRecordAttendance, facultyUpdateAssignment } from "../controllers/faculty.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
import { UserRole } from "../generated/prisma/client.js";

const router = Router();
const admin = [authMiddleware, adminMiddleware];
const faculty = [authMiddleware, requireRoles(UserRole.FACULTY)];

router.post("/courses", ...admin, createCourse);
router.patch("/courses/:id", ...admin, updateCourse);
router.delete("/courses/:id", ...admin, deleteCourse);
router.post("/course-offerings", ...admin, createCourseOffering);
router.patch("/course-offerings/:id", ...admin, updateCourseOffering);
router.delete("/course-offerings/:id", ...admin, deleteCourseOffering);
router.post("/timetable", ...admin, createTimetableEntry);
router.patch("/timetable/:id", ...admin, updateTimetableEntry);
router.delete("/timetable/:id", ...admin, deleteTimetableEntry);
router.post("/assignments", ...admin, createAssignment);
router.patch("/assignments/:id", ...admin, updateAssignment);
router.delete("/assignments/:id", ...admin, deleteAssignment);
router.post("/attendance", ...admin, recordAttendance);
router.post("/enrollments", ...admin, createEnrollment);
router.delete("/enrollments/:id", ...admin, deleteEnrollment);
router.post("/faculty-courses", ...admin, assignFacultyToCourse);
router.delete("/faculty-courses/:id", ...admin, removeFacultyFromCourse);

// Faculty-only restricted endpoints. Admin equivalents above retain full access.
router.post("/faculty/assignments", ...faculty, facultyCreateAssignment);
router.patch("/faculty/assignments/:id", ...faculty, facultyUpdateAssignment);
router.delete("/faculty/assignments/:id", ...faculty, facultyDeleteAssignment);
router.post("/faculty/attendance", ...faculty, facultyRecordAttendance);

export default router;
