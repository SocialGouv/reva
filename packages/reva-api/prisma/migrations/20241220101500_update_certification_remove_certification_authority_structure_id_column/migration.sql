/*
  Warnings:

  - You are about to drop the column `certification_authority_structure_id` on the `certification_authority` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_authority" DROP CONSTRAINT "certification_authority_certification_authority_structure__fkey";

-- AlterTable
ALTER TABLE "certification_authority" DROP COLUMN "certification_authority_structure_id";
