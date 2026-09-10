import { Router } from "express";
import { getAttendance, getAttendanceSummary, getCourseAttendance } from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/summary", authMiddleware, getAttendanceSummary);
router.get("/", authMiddleware, getAttendance);
router.get("/:courseId", authMiddleware, getCourseAttendance);
export default router;
