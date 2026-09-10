CREATE TABLE "FacultyCourse" (
  "id" SERIAL NOT NULL,
  "facultyId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  CONSTRAINT "FacultyCourse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FacultyCourse_facultyId_courseId_key" ON "FacultyCourse"("facultyId", "courseId");
CREATE INDEX "FacultyCourse_facultyId_idx" ON "FacultyCourse"("facultyId");
CREATE INDEX "FacultyCourse_courseId_idx" ON "FacultyCourse"("courseId");

ALTER TABLE "FacultyCourse"
  ADD CONSTRAINT "FacultyCourse_facultyId_fkey"
  FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FacultyCourse"
  ADD CONSTRAINT "FacultyCourse_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
