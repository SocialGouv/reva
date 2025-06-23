-- CreateEnum
CREATE TYPE "CandidacyArchivalReason" AS ENUM (
    'INACTIVITE_CANDIDAT',
    'REORIENTATION_HORS_FRANCE_VAE',
    'PROBLEME_FINANCEMENT',
    'AUTRE',
    'MULTI_CANDIDATURES',
    'PASSAGE_AUTONOME_A_ACCOMPAGNE'
);

-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "archivalReason" "CandidacyArchivalReason",
ADD COLUMN "archival_reason_additional_information" TEXT;