-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'REPRISE_EMPLOI';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'ENTREE_EN_FORMATION';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'DECOURAGEMENT';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'RAISONS_PERSONNELLES';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'CHANGEMENT_DE_PROJET';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'MANQUE_DE_TEMPS';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'NON_INTERESSE';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'REMUNERATION_NON_OBTENUE';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'AVIS_DEFAVORABLE_AAP';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'PROBLEME_FINANCEMENT_PARCOURS';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'PROBLEME_FINANCEMENT_CERTIFICATEUR';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'DELAIS_TROP_LONG';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'NON_OBTENTION_PRE_REQUIS';
ALTER TYPE "CandidacyArchivingReason" ADD VALUE 'CANDIDATURE_CREEE_PAR_ERREUR';
