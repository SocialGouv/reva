TRUNCATE TABLE "candidacy_log";

-- AlterTable
ALTER TABLE "candidacy_log" ADD COLUMN     "user_email" VARCHAR(255) NOT NULL;
