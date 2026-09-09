import "dotenv/config";

import app from "./app.js";

import { prisma } from "./config/database.js";


const PORT = process.env.PORT || 5000;


async function startServer() {

    try {

        // Connect to database
        await prisma.$connect();

        console.log(
            "Database connected successfully"
        );


        // Start Express server
        app.listen(PORT, () => {

            console.log(
                `CampusHub API running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Failed to start server:"
        );

        console.error(error);

        process.exit(1);
    }
}


startServer();