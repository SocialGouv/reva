-- DropForeignKey
ALTER TABLE "certification_additional_info" DROP CONSTRAINT "certification_additional_info_dossier_de_validation_file_i_fkey";

-- AddForeignKey
ALTER TABLE "certification_additional_info" ADD CONSTRAINT "certification_additional_info_dossier_de_validation_file_i_fkey" FOREIGN KEY ("dossier_de_validation_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
