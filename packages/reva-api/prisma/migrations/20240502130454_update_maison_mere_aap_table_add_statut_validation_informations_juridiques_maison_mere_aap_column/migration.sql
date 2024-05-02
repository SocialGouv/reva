-- CreateEnum
CREATE TYPE "StatutValidationInformationsJuridiquesMaisonMereAAP" AS ENUM ('A_METTRE_A_JOUR', 'EN_ATTENTE_DE_VERIFICATION', 'A_JOUR');

-- AlterTable
ALTER TABLE "maison_mere_aap" ADD COLUMN     "statut_validation_informations_juridiques_maison_mere_aap" "StatutValidationInformationsJuridiquesMaisonMereAAP" NOT NULL DEFAULT 'A_METTRE_A_JOUR';
