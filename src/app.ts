import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();


// -------------------------
// Middleware
// -------------------------

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());


// -------------------------
// Health Check
// -------------------------

app.get("/", (_req, res) => {

    res.json({
        message: "CampusHub API is running 🚀",
    });

});


app.get("/api/health", (_req, res) => {

    res.json({
        success: true,
        status: "ok",
        service: "CampusHub API",
    });

});


// -------------------------
// API Routes
// -------------------------

app.use(
    "/api/courses",
    courseRoutes
);

app.use(
    "/api/assignments",
    assignmentRoutes
);


app.use(
    "/api/auth",
    authRoutes
);

app.use("/api/users", userRoutes);

app.use("/api/timetable", timetableRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// -------------------------
// Error Handler
// -------------------------

app.use(errorMiddleware);


export default app;
