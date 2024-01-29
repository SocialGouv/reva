TRUNCATE TABLE "dossier_de_validation" CASCADE;

-- AlterTable
ALTER TABLE "dossier_de_validation" ADD COLUMN     "certification_authority_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "dossier_de_validation" ADD CONSTRAINT "dossier_de_validation_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
