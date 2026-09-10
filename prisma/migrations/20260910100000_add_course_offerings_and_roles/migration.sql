-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- The legacy schedule columns cannot be mapped to CourseOffering/TimetableEntry:
-- they contain no branch, semester, or day-of-week information.
ALTER TABLE "Course"
  DROP COLUMN "room",
  DROP COLUMN "startTime",
  DROP COLUMN "endTime";

-- CreateTable
CREATE TABLE "CourseOffering" (
  "id" SERIAL NOT NULL,
  "courseId" INTEGER NOT NULL,
  "branch" TEXT NOT NULL,
  "semester" INTEGER NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
  "id" SERIAL NOT NULL,
  "courseOfferingId" INTEGER NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "room" TEXT NOT NULL,
  "type" TEXT,

  CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_branch_semester_key"
  ON "CourseOffering"("courseId", "branch", "semester");
CREATE INDEX "CourseOffering_branch_semester_idx"
  ON "CourseOffering"("branch", "semester");
CREATE INDEX "TimetableEntry_courseOfferingId_dayOfWeek_idx"
  ON "TimetableEntry"("courseOfferingId", "dayOfWeek");
CREATE INDEX "TimetableEntry_dayOfWeek_startTime_idx"
  ON "TimetableEntry"("dayOfWeek", "startTime");
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");
CREATE INDEX "Assignment_courseId_idx" ON "Assignment"("courseId");
CREATE INDEX "Assignment_duedate_idx" ON "Assignment"("duedate");
CREATE INDEX "AssignmentProgress_userId_idx" ON "AssignmentProgress"("userId");
CREATE INDEX "AssignmentProgress_assignmentId_idx" ON "AssignmentProgress"("assignmentId");
CREATE INDEX "Attendance_userId_courseId_idx" ON "Attendance"("userId", "courseId");
CREATE INDEX "Attendance_courseId_date_idx" ON "Attendance"("courseId", "date");

-- AddForeignKey
ALTER TABLE "CourseOffering"
  ADD CONSTRAINT "CourseOffering_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimetableEntry"
  ADD CONSTRAINT "TimetableEntry_courseOfferingId_fkey"
  FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing relations to the finalized cascade behavior.
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_courseId_fkey";
ALTER TABLE "AssignmentProgress" DROP CONSTRAINT "AssignmentProgress_userId_fkey";
ALTER TABLE "AssignmentProgress" DROP CONSTRAINT "AssignmentProgress_assignmentId_fkey";

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentProgress"
  ADD CONSTRAINT "AssignmentProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentProgress"
  ADD CONSTRAINT "AssignmentProgress_assignmentId_fkey"
  FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
