-- AlterTable
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD COLUMN     "gestionnaire_email" TEXT,
ADD COLUMN     "gestionnaire_firstname" TEXT,
ADD COLUMN     "gestionnaire_lastname" TEXT,
ADD COLUMN     "phone" VARCHAR(50),
ADD COLUMN     "raison_sociale" VARCHAR(255),
ADD COLUMN     "siret" VARCHAR(255),
ADD COLUMN     "statut_juridique" "LegalStatus";
