import type { Request, Response } from "express";
import { prisma } from "../config/database.js";


// GET /api/assignments
export const getAssignments = async (
    _req: Request,
    res: Response
) => {

    try {

        const assignments = await prisma.assignment.findMany({
            include: {
                course: true,
            },
            orderBy: {
                duedate: "asc",
            },
        });

        res.json({
            success: true,
            data: assignments,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch assignments",
        });
    }
};


// GET /api/assignments/:id
export const getAssignmentById = async (
    req: Request,
    res: Response
) => {

    try {

        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID",
            });
        }

        const assignment = await prisma.assignment.findUnique({
            where: {
                id,
            },
            include: {
                course: true,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        res.json({
            success: true,
            data: assignment,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch assignment",
        });
    }
};