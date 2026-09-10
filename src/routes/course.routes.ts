import { Router } from "express";
import { enrollInCourse, getAvailableCourses, getCourseById, getCourses, unenrollFromCourse } from "../controllers/course.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/available", authMiddleware, getAvailableCourses);
router.get("/", authMiddleware, getCourses);
router.get("/:id", authMiddleware, getCourseById);
router.post("/:id/enroll", authMiddleware, enrollInCourse);
router.delete("/:id/enroll", authMiddleware, unenrollFromCourse);

export default router;
