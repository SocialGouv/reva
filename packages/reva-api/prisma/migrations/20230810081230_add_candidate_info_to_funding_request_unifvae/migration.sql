-- AlterEnum
ALTER TYPE "FinanceModule"
ADD VALUE 'rsmfvae';
-- AlterTable
ALTER TABLE "funding_request_unifvae"
ADD COLUMN "candidate_firstname" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "candidate_gender" "Gender" NOT NULL DEFAULT 'undisclosed',
  ADD COLUMN "candidate_lastname" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "candidate_secondname" TEXT,
  ADD COLUMN "candidate_thirdname" TEXT;