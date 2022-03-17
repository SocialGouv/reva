/*
  Warnings:

  - You are about to drop the column `description` on the `certification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certification" DROP COLUMN "description",
ADD COLUMN     "summary" TEXT;
