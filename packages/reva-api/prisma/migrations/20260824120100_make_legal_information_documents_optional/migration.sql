-- Une mise a jour en self-service peut ne porter que sur les informations de connexion
-- et de contact: aucune piece justificative n'est alors demandee.
ALTER TABLE "maison_mere_aap_legal_information_documents"
  ALTER COLUMN "attestation_urssaf_file_id" DROP NOT NULL,
  ALTER COLUMN "justificatif_identite_dirigeant_file_id" DROP NOT NULL;
