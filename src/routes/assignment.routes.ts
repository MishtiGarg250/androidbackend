import { Router } from "express";

import {
    getAssignments,
    getAssignmentById,
} from "../controllers/assignment.controller.js";

const router = Router();

router.get("/", getAssignments);

router.get("/:id", getAssignmentById);

export default router;