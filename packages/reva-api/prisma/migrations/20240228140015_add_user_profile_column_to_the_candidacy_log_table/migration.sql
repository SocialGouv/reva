
TRUNCATE TABLE candidacy_log;

-- CreateEnum
CREATE TYPE "CandidacyLogUserProfile" AS ENUM ('ADMIN', 'CANDIDAT', 'CERTIFICATEUR', 'AAP');

-- AlterTable
ALTER TABLE "candidacy_log" ADD COLUMN     "user_profile" "CandidacyLogUserProfile" NOT NULL;
