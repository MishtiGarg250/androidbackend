import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export interface JwtTokenPayload { userId: number; }

export const generateToken = (userId: number): string =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): JwtTokenPayload => {
  const payload = jwt.verify(token, JWT_SECRET);
  if (typeof payload !== "object" || payload === null || typeof payload.userId !== "number" || !Number.isInteger(payload.userId)) {
    throw new Error("Invalid token payload");
  }
  return { userId: payload.userId };
};
