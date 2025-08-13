/*
  Warnings:

  - The values [DEMANDE_FINANCEMENT_ENVOYE,DEMANDE_PAIEMENT_ENVOYEE] on the enum `CandidacyStatusStep` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CandidacyStatusStep_new" AS ENUM ('ARCHIVE', 'PROJET', 'VALIDATION', 'PRISE_EN_CHARGE', 'PARCOURS_ENVOYE', 'PARCOURS_CONFIRME', 'DOSSIER_FAISABILITE_ENVOYE', 'DOSSIER_FAISABILITE_COMPLET', 'DOSSIER_FAISABILITE_INCOMPLET', 'DOSSIER_FAISABILITE_RECEVABLE', 'DOSSIER_FAISABILITE_NON_RECEVABLE', 'DOSSIER_DE_VALIDATION_ENVOYE', 'DOSSIER_DE_VALIDATION_SIGNALE', 'DOSSIER_PRO', 'CERTIFICATION');
ALTER TABLE "candidacy" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "candidacy" ALTER COLUMN "status" TYPE "CandidacyStatusStep_new" USING ("status"::text::"CandidacyStatusStep_new");
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" TYPE "CandidacyStatusStep_new" USING ("status"::text::"CandidacyStatusStep_new");
ALTER TABLE "candidacy_drop_out" ALTER COLUMN "status" TYPE "CandidacyStatusStep_new" USING ("status"::text::"CandidacyStatusStep_new");
ALTER TYPE "CandidacyStatusStep" RENAME TO "CandidacyStatusStep_old";
ALTER TYPE "CandidacyStatusStep_new" RENAME TO "CandidacyStatusStep";
DROP TYPE "CandidacyStatusStep_old";
ALTER TABLE "candidacy" ALTER COLUMN "status" SET DEFAULT 'PROJET';
ALTER TABLE "candidacy_candidacy_status" ALTER COLUMN "status" SET DEFAULT 'PROJET';
COMMIT;
