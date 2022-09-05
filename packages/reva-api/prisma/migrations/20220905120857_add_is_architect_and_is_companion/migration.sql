-- AlterTable
ALTER TABLE "organism_region_certification" ADD COLUMN     "is_architect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_companion" BOOLEAN NOT NULL DEFAULT false;
