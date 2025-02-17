-- AlterTable
ALTER TABLE "certification_additional_info" ADD COLUMN     "certification_expert_contact_email" VARCHAR(255),
ADD COLUMN     "certification_expert_contact_phone" VARCHAR(50),
ADD COLUMN     "dossier_de_validation_link" TEXT,
ALTER COLUMN "dossier_de_validation_file_id" DROP NOT NULL;
