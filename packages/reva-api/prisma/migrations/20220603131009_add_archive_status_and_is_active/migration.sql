-- AlterEnum
ALTER TYPE "CandidacyStatus" ADD VALUE 'ARCHIVE';

-- AlterTable
ALTER TABLE "candidacy_candidacy_status" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;
