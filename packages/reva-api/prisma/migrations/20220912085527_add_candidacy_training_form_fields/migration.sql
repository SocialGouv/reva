-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "additional_hour_count" INTEGER,
ADD COLUMN     "certificate_skills" TEXT,
ADD COLUMN     "collective_hour_count" INTEGER,
ADD COLUMN     "individual_hour_count" INTEGER,
ADD COLUMN     "other_training" TEXT,
ADD COLUMN     "validated_by_candidate" BOOLEAN;
