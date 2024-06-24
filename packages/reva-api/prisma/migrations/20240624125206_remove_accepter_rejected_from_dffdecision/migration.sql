/*
  Warnings:

  - The values [ACCEPTED,REJECTED] on the enum `DFFDecision` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DFFDecision_new" AS ENUM ('FAVORABLE', 'UNFAVORABLE');
ALTER TABLE "dematerialized_feasibility_file" ALTER COLUMN "app_decision" TYPE "DFFDecision_new" USING ("app_decision"::text::"DFFDecision_new");
ALTER TYPE "DFFDecision" RENAME TO "DFFDecision_old";
ALTER TYPE "DFFDecision_new" RENAME TO "DFFDecision";
DROP TYPE "DFFDecision_old";
COMMIT;
