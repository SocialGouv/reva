/*
  Warnings:

  - You are about to drop the column `type_diplome_id` on the `certification` table. All the data in the column will be lost.
  - You are about to drop the `type_diplome` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification" DROP CONSTRAINT "certification_type_diplome_id_fkey";

-- DropIndex
DROP INDEX "certification_type_diplome_id_idx";

-- AlterTable
ALTER TABLE "certification" DROP COLUMN "type_diplome_id";

-- DropTable
DROP TABLE "type_diplome";
