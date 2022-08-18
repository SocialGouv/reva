/*
  Warnings:

  - You are about to drop the column `companion_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organism` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_companion_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_region_certification" DROP CONSTRAINT "candidacy_region_certification_region_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_organism_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_region_certification" DROP CONSTRAINT "organism_region_certification_region_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "companion_id",
ADD COLUMN     "organism_id" UUID;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Organism";

-- DropTable
DROP TABLE "Region";

-- DropTable
DROP TABLE "companion";

-- CreateTable
CREATE TABLE "region" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "code" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organism" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "organism_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "region_label_key" ON "region"("label");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_region_certification" ADD CONSTRAINT "candidacy_region_certification_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
