/*
  Warnings:

  - You are about to drop the column `certification_id` on the `candidacy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_certification_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "certification_id";

-- CreateTable
CREATE TABLE "Region" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "code" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_region_certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "author" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_region_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organism" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "Organism_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organism_region_certification" (
    "organism_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organism_region_certification_pkey" PRIMARY KEY ("organism_id","region_id","certification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_label_key" ON "Region"("label");

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_region_certification_candidacy_id_key" ON "candidacy_region_certification"("candidacy_id");

-- AddForeignKey
ALTER TABLE "candidacy_region_certification" ADD CONSTRAINT "candidacy_region_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_region_certification" ADD CONSTRAINT "candidacy_region_certification_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_region_certification" ADD CONSTRAINT "candidacy_region_certification_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
