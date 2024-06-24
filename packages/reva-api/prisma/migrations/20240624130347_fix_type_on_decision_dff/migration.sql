/*
  Warnings:

  - You are about to drop the column `app_decision` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.
  - You are about to drop the column `app_decision_comment` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.
  - You are about to drop the column `app_decision_sent_at` on the `dematerialized_feasibility_file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" DROP COLUMN "app_decision",
DROP COLUMN "app_decision_comment",
DROP COLUMN "app_decision_sent_at",
ADD COLUMN     "aap_decision" "DFFDecision",
ADD COLUMN     "aap_decision_comment" TEXT,
ADD COLUMN     "aap_decision_sent_at" TIMESTAMPTZ(6);
