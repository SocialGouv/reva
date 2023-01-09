/*
  Warnings:

  - The values [ABANDON] on the enum `CandidacyStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CandidacyStatus_new" AS ENUM ('ARCHIVE', 'PROJET', 'VALIDATION', 'PRISE_EN_CHARGE', 'PARCOURS_ENVOYE', 'PARCOURS_CONFIRME', 'DEMANDE_FINANCEMENT_ENVOYE', 'DOSSIER_PRO', 'CERTIFICATION');
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" TYPE "CandidacyStatus_new" USING ("status"::text::"CandidacyStatus_new");
ALTER TABLE "candidacy_drop_out" ALTER COLUMN "status" TYPE "CandidacyStatus_new" USING ("status"::text::"CandidacyStatus_new");
ALTER TYPE "CandidacyStatus" RENAME TO "CandidacyStatus_old";
ALTER TYPE "CandidacyStatus_new" RENAME TO "CandidacyStatus";
DROP TYPE "CandidacyStatus_old";
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" SET DEFAULT 'PROJET';
COMMIT;
