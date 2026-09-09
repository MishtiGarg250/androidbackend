import type { Request, Response } from "express";
import { prisma } from "../config/database.js";


// GET /api/courses
export const getCourses = async (
    _req: Request,
    res: Response
) => {

    try {

        const courses = await prisma.course.findMany({
            orderBy: {
                startTime: "asc",
            },
        });

        res.json({
            success: true,
            data: courses,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
};


// GET /api/courses/:id
export const getCourseById = async (
    req: Request,
    res: Response
) => {

    try {

        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await prisma.course.findUnique({
            where: {
                id,
            },
            include: {
                assignments: true,
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.json({
            success: true,
            data: course,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch course",
        });
    }
};