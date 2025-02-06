/*
  Warnings:

  - You are about to drop the column `department_id` on the `candidacy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_department_id_fkey";

-- DropIndex
DROP INDEX "candidacy_department_id_idx";

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "department_id";
