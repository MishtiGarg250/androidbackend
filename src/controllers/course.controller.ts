import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import {AuthenticatedRequest} from "../middleware/auth.middleware.js"

// GET /api/courses
export const getCourses = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {
        const userId = Number(req.userId);
        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }
        const courses = await prisma.course.findMany({
            where:{
                enrollments:{
                    some:{
                        userId
                    }
                }
            },
            orderBy:{
                code:"asc"
            }
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
