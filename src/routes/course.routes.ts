import { Router } from "express";

import {
    getCourses,
    getCourseById,
} from "../controllers/course.controller.js";

const router = Router();

router.get("/", getCourses);

router.get("/:id", getCourseById);

export default router;