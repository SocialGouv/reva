-- CreateEnum
CREATE TYPE "DFFEligibilityCandidateSituation" AS ENUM (
    'PREMIERE_DEMANDE_RECEVABILITE',
    'DETENTEUR_RECEVABILITE',
    'DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL',
    'DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL'
);

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file"
ADD COLUMN "eligibility_candidate_situation" "DFFEligibilityCandidateSituation";