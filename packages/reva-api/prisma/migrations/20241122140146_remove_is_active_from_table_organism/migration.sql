/*
  Warnings:

  - You are about to drop the column `is_active` on the `organism` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "organism_typology_is_active_idx";

-- AlterTable
ALTER TABLE "organism" DROP COLUMN "is_active";
