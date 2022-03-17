/*
  Warnings:

  - Added the required column `acronym` to the `certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `certification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "abilities" TEXT,
ADD COLUMN     "accessible_job_type" TEXT,
ADD COLUMN     "acronym" VARCHAR(255) NOT NULL,
ADD COLUMN     "activities" TEXT,
ADD COLUMN     "activity_area" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL;
