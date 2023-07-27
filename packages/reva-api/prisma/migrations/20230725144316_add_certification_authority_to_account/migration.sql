-- AlterTable
ALTER TABLE "account" ADD COLUMN     "certification_authority_id" UUID;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

