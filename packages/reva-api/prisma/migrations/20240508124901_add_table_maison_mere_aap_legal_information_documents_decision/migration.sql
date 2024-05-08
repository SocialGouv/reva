-- CreateEnum
CREATE TYPE "MaisonMereAAPLegalInformationDocumentsDecisionEnum" AS ENUM ('VALIDE', 'DEMANDE_DE_PRECISION');

-- CreateTable
CREATE TABLE "maison_mere_aap_legal_information_documents_decision" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "maison_mere_aap_id" UUID NOT NULL,
    "decision" "MaisonMereAAPLegalInformationDocumentsDecisionEnum" NOT NULL,
    "internal_comment" TEXT NOT NULL,
    "aap_comment" TEXT NOT NULL,
    "aap_updated_documents_at" TIMESTAMPTZ(6) NOT NULL,
    "decision_taken_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maison_mere_aap_legal_information_documents_decision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents_decision" ADD CONSTRAINT "maison_mere_aap_legal_information_documents_decision_maiso_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
