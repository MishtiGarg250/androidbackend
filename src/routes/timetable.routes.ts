import { Router } from "express";
import { getNextClass, getTimetableEntries, getTodayTimetable } from "../controllers/timetable.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/today", authMiddleware, getTodayTimetable);
router.get("/next", authMiddleware, getNextClass);
router.get("/", authMiddleware, getTimetableEntries);

export default router;
