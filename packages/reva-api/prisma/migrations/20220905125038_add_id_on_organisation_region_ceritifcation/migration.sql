/*
  Warnings:

  - The primary key for the `organism_region_certification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[organism_id,region_id,certification_id]` on the table `organism_region_certification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "organism_region_certification_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "organism_region_certification_organism_id_region_id_certifi_key" ON "organism_region_certification"("organism_id", "region_id", "certification_id");
