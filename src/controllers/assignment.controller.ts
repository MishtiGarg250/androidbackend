import type { Response } from "express";
import { prisma } from "../config/database.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

// GET /api/assignments
// Returns assignments only for courses the logged-in user is enrolled in
export const getAssignments = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = Number(req.userId);

        if (!req.userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const assignments = await prisma.assignment.findMany({
            where: {
                course: {
                    enrollments: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            },

            include: {
                course: true,
                progress:{
                    where:{
                        userId:userId
                    }
                }
            },

            orderBy: {
                duedate: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            data: assignments,
        });

    } catch (error) {
        console.error("Get assignments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch assignments",
        });
    }
};


// GET /api/assignments/:id
// Returns an assignment only if the logged-in user
// is enrolled in the assignment's course
export const getAssignmentById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = Number(req.userId);

        if (!req.userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID",
            });
        }

        const assignment = await prisma.assignment.findFirst({
            where: {
                id: id,

                course: {
                    enrollments: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            },

            include: {
                course: true,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found or you are not enrolled in this course",
            });
        }

        return res.status(200).json({
            success: true,
            data: assignment,
        });

    } catch (error) {
        console.error("Get assignment by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch assignment",
        });
    }
};

export const completeAssignment = async(
    req: AuthenticatedRequest,
    res: Response
)=>{
    try{
        const userId = Number(req.userId);
        if(!req.userId || Number.isNaN(userId)){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            });
        }

        const assignmentId = Number(req.params.id);
        if(Number.isNaN(assignmentId)){
            return res.status(400).json({
                success:false,
                message:"Invalid assignment ID",
            });
        }

        const assignment = await prisma.assignment.findUnique({
            where:{
                id:assignmentId
            },
            include:{
                course:{
                    include:{
                        enrollments:{
                            where:{
                                userId:userId,
                            }
                        }
                    }
                }
            }
        });

        if(!assignment){
            return res.status(404).json({
                success:false,
                message:"Assignment not found",
            });
        }

        if(assignment.course.enrollments.length === 0){
            return res.status(403).json({
                success:false,
                message:"You are not enrolled in this course",
            })
        }

        const progress = await prisma.assignmentProgress.upsert({
            where:{
                userId_assignmentId:{
                    userId:userId,
                    assignmentId:assignmentId
                }
            },

            update:{
                completed:true,
                completedAt:new Date()
            },
            create:{
                userId:userId,
                assignmentId:assignmentId,
                completed:true,
                completedAt:new Date()
            }
        });

        return res.status(200).json({
            success:true,
            message:"Assignment marked as completed",
            data: progress,
        })
    }catch(error){
        console.error("Complete assignment error:", error);
        return res.status(500).json({
            success:false,
            message:"Failed to complete assignment",
        });
    }
}