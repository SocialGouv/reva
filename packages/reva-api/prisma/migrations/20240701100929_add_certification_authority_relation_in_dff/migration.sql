-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "certification_authority_id" UUID;

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
