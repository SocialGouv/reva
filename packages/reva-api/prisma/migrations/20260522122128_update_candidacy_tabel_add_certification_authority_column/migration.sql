-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "certification_authority_id" UUID;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
