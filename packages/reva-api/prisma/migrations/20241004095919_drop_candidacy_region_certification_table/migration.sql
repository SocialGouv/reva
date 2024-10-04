/*
  Warnings:

  - You are about to drop the `candidacy_region_certification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidacy_region_certification" DROP CONSTRAINT "candidacy_region_certification_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_region_certification" DROP CONSTRAINT "candidacy_region_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_region_certification" DROP CONSTRAINT "candidacy_region_certification_region_id_fkey";

-- DropTable
DROP TABLE "candidacy_region_certification";
