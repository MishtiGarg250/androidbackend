import type {Request,Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {prisma} from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET){
    throw new Error('JWT_SECRET is not defined');
}

export const register = async(
    req: Request,
    res: Response
)=>{
    try{
        const {name,email,password,rollNo,branch,semester}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Name,email and password are required"
            });
        }

        const existingUser = await prisma.user.findUnique({
            where:{
                email
            }
        });

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword,
                rollNo,
                branch,
                semester
            }
        });
        return res.status(201).json({
            success:true,
            data:{
                id:user.id,
                name:user.name,
                email:user.email,
            },
            message:"User registered successfully"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Registration failed"
        })
    }
}

export const login = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user =
            await prisma.user.findUnique({
                where: {
                    email
                }
            });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token =
            jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        return res.json({

            success: true,

            data: {
                token,

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    
                }
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};