/*
  Warnings:

  - You are about to drop the column `decision` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.
  - You are about to drop the column `decision_comment` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.
  - You are about to drop the column `decision_sent_at` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DFFDecision" ADD VALUE 'FAVORABLE';
ALTER TYPE "DFFDecision" ADD VALUE 'UNFAVORABLE';

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" DROP COLUMN "decision",
DROP COLUMN "decision_comment",
DROP COLUMN "decision_sent_at",
ADD COLUMN     "app_decision" "DFFDecision",
ADD COLUMN     "app_decision_comment" TEXT,
ADD COLUMN     "app_decision_sent_at" TIMESTAMPTZ(6);
