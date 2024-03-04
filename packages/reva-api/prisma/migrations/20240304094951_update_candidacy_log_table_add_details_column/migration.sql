TRUNCATE TABLE "candidacy_log";

-- AlterTable
ALTER TABLE "candidacy_log" ADD COLUMN     "details" JSONB;
