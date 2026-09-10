import { UserRole } from "../generated/prisma/client.js";
import { requireRoles } from "./role.middleware.js";

export const adminMiddleware = requireRoles(UserRole.ADMIN);
