import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import authRoutes from "./routes/authRoutes.js";
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

// -------------------------
// Error Handler
// -------------------------

app.use(errorMiddleware);


export default app;