-- CreateTable
CREATE TABLE "maison_mere_aap_legal_information_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "maison_mere_aap_id" UUID NOT NULL,
    "manager_firstname" TEXT NOT NULL,
    "manager_lastname" TEXT NOT NULL,
    "delagataire" BOOLEAN NOT NULL,
    "attestation_urssaf_file_id" UUID NOT NULL,
    "justificatif_identite_dirigeant_file_id" UUID NOT NULL,
    "lettre_de_delegation_file_id" UUID,
    "justificatif_identite_delegataire_file_id" UUID,

    CONSTRAINT "maison_mere_aap_legal_information_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maison_mere_aap_legal_information_documents_maison_mere_aap_key" ON "maison_mere_aap_legal_information_documents"("maison_mere_aap_id");

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "maison_mere_aap_legal_information_documents_maison_mere_aa_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "maison_mere_aap_legal_information_documents_attestation_ur_fkey" FOREIGN KEY ("attestation_urssaf_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "mmaap_justificatif_identite_dirigeant_file" FOREIGN KEY ("justificatif_identite_dirigeant_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "maison_mere_aap_legal_information_documents_lettre_de_dele_fkey" FOREIGN KEY ("lettre_de_delegation_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "mmaap_justificatif_identite_delegataire_file" FOREIGN KEY ("justificatif_identite_delegataire_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
