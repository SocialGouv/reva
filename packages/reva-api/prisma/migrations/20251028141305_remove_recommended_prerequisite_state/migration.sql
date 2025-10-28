-- First, we need to change all 'recommended' prerequisites to 'in progress'
UPDATE "dff_prerequisite" SET "state" = 'IN_PROGRESS' WHERE "state" = 'RECOMMENDED';
/*
  Warnings:

  - The values [RECOMMENDED] on the enum `PrerequisiteState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrerequisiteState_new" AS ENUM ('ACQUIRED', 'IN_PROGRESS');
ALTER TABLE "dff_prerequisite" ALTER COLUMN "state" TYPE "PrerequisiteState_new" USING ("state"::text::"PrerequisiteState_new");
ALTER TYPE "PrerequisiteState" RENAME TO "PrerequisiteState_old";
ALTER TYPE "PrerequisiteState_new" RENAME TO "PrerequisiteState";
DROP TYPE "PrerequisiteState_old";
COMMIT;
