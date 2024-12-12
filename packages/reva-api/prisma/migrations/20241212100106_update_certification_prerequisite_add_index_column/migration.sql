/*
  Warnings:

  - Added the required column `index` to the `certification_prerequisite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "certification_prerequisite" ADD COLUMN     "index" INTEGER NOT NULL;
