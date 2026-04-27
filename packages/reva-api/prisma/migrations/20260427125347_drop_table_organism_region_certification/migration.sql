/*
  Warnings:

  - You are about to drop the `organism_region_certification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_organism_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_region_id_fkey";

-- DropTable
DROP TABLE "organism_region_certification";
