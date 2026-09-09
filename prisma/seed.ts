import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}


const adapter = new PrismaPg({
    connectionString,
});


const prisma = new PrismaClient({
    adapter,
});


async function main() {

    console.log("Seeding database...");


    // Create courses
    const digitalElectronics = await prisma.course.upsert({

        where: {
            code: "ECE201",
        },

        update: {},

        create: {
            name: "Digital Electronics",
            code: "ECE201",
            teacher: "Dr. Sharma",
            room: "C-204",
            startTime: "10:00 AM",
            endTime: "11:00 AM",
        },
    });


    const dataStructures = await prisma.course.upsert({

        where: {
            code: "CSE102",
        },

        update: {},

        create: {
            name: "Data Structures",
            code: "CSE102",
            teacher: "Dr. Kumar",
            room: "A-105",
            startTime: "12:00 PM",
            endTime: "01:00 PM",
        },
    });


    // Create assignments
    await prisma.assignment.create({

        data: {
            title: "Digital Logic Design",
            description: "Complete the assigned digital logic problems.",
            duedate: new Date("2026-09-10"),
            courseId: digitalElectronics.id,
        },
    });


    await prisma.assignment.create({

        data: {
            title: "Binary Search Tree",
            description: "Implement BST operations in C++.",
            duedate: new Date("2026-09-12"),
            courseId: dataStructures.id,
        },
    });


    console.log("Database seeded successfully!");
}


main()
    .catch((error) => {

        console.error(error);

        process.exit(1);

    })
    .finally(async () => {

        await prisma.$disconnect();

    });