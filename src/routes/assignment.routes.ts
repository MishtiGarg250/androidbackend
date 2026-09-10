import { Router } from "express";
import { completeAssignment, getAssignmentById, getAssignments, incompleteAssignment } from "../controllers/assignment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAssignments);
router.get("/:id", authMiddleware, getAssignmentById);
router.patch("/:id/complete", authMiddleware, completeAssignment);
router.patch("/:id/incomplete", authMiddleware, incompleteAssignment);

export default router;
