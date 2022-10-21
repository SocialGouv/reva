/*
  Warnings:

  - Made the column `firstname` on table `candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastname` on table `candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `candidate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "candidate" ALTER COLUMN "firstname" SET NOT NULL,
ALTER COLUMN "lastname" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
