
-- AlterTable
ALTER TABLE "feasibility" RENAME COLUMN "status" TO "decision";
ALTER TABLE "feasibility" ADD COLUMN "decision_sent_at" TIMESTAMPTZ(6);