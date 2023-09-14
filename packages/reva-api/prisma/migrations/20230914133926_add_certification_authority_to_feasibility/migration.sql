-- AlterTable
ALTER TABLE "feasibility" ADD COLUMN     "certification_authority_id" UUID;

-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;
