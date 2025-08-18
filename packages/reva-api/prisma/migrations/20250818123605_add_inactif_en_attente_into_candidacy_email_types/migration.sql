-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CandidacyEmailType" ADD VALUE 'INACTIF_EN_ATTENTE_BEFORE_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE';
ALTER TYPE "CandidacyEmailType" ADD VALUE 'INACTIF_EN_ATTENTE_AFTER_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE';
