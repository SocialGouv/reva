/*
  Warnings:

  - You are about to drop the column `archivalReason` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `archival_reason_additional_information` on the `candidacy` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CandidacyArchivingReason" AS ENUM ('INACTIVITE_CANDIDAT', 'REORIENTATION_HORS_FRANCE_VAE', 'PROBLEME_FINANCEMENT', 'AUTRE', 'MULTI_CANDIDATURES', 'PASSAGE_AUTONOME_A_ACCOMPAGNE');

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "archivalReason",
DROP COLUMN "archival_reason_additional_information",
ADD COLUMN     "archivingReason" "CandidacyArchivingReason",
ADD COLUMN     "archiving_reason_additional_information" TEXT;

-- DropEnum
DROP TYPE "CandidacyArchivalReason";
