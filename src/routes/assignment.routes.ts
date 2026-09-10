import { Router } from "express";

import {
    getAssignments,
    getAssignmentById,
    completeAssignment,
} from "../controllers/assignment.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js" 
const router = Router();

router.get("/", authMiddleware, getAssignments);

router.get("/:id", authMiddleware, getAssignmentById);
router.patch("/:id/complete", authMiddleware, completeAssignment);
export default router;