-- CreateEnum
CREATE TYPE "DFFDecision" AS ENUM ('ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "decision" "DFFDecision",
ADD COLUMN     "decision_comment" TEXT,
ADD COLUMN     "decision_sent_at" TIMESTAMPTZ(6);
