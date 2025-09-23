/*
  Warnings:

  - The values [CONFIRMED] on the enum `EndAccompagnementStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EndAccompagnementStatus_new" AS ENUM ('NOT_REQUESTED', 'PENDING', 'CONFIRMED_BY_CANDIDATE', 'CONFIRMED_BY_ADMIN');
ALTER TABLE "candidacy" ALTER COLUMN "end_accompagnement_status" DROP DEFAULT;
ALTER TABLE "candidacy" ALTER COLUMN "end_accompagnement_status" TYPE "EndAccompagnementStatus_new" USING ("end_accompagnement_status"::text::"EndAccompagnementStatus_new");
ALTER TYPE "EndAccompagnementStatus" RENAME TO "EndAccompagnementStatus_old";
ALTER TYPE "EndAccompagnementStatus_new" RENAME TO "EndAccompagnementStatus";
DROP TYPE "EndAccompagnementStatus_old";
ALTER TABLE "candidacy" ALTER COLUMN "end_accompagnement_status" SET DEFAULT 'NOT_REQUESTED';
COMMIT;
