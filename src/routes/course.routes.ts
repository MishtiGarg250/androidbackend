import { Router } from "express";

import {
    getCourses,
    getCourseById,
} from "../controllers/course.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getCourses);

router.get("/:id", authMiddleware, getCourseById);

export default router;