-- DropForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" DROP CONSTRAINT "maison_mere_aap_legal_information_documents_attestation_ur_fkey";

-- DropForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" DROP CONSTRAINT "mmaap_justificatif_identite_dirigeant_file";

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "maison_mere_aap_legal_information_documents_attestation_ur_fkey" FOREIGN KEY ("attestation_urssaf_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD CONSTRAINT "mmaap_justificatif_identite_dirigeant_file" FOREIGN KEY ("justificatif_identite_dirigeant_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
