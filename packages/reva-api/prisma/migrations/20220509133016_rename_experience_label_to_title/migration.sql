/*
  Warnings:

  - You are about to drop the column `label` on the `experience` table. All the data in the column will be lost.
  - Added the required column `title` to the `experience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "experience" DROP COLUMN "label",
ADD COLUMN     "title" TEXT NOT NULL;
