import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "campushub_super_secret_key_change_this";

if(!JWT_SECRET){
    throw new Error("JT_SECRET is not defined");
}

export interface JtPayload{
    userId: string;
}

export function generateToken(userId: string){
    return jwt.sign({userId,},JWT_SECRET,{expiresIn:"7d"})
}

export function verifyToken(token:string): JwtPayload{
    return jwt.verify(
        token,JWT_SECRET
    ) as JwtPayload
}