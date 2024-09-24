-- CreateEnum
CREATE TYPE "CandidacyTypeAccompagnement" AS ENUM ('AUTONOME', 'ACCOMPAGNE');

-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "type_accompagnement" "CandidacyTypeAccompagnement" NOT NULL DEFAULT 'ACCOMPAGNE';