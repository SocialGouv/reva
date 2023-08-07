-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_certification_authority_id_fkey";
-- AddForeignKey
ALTER TABLE "account"
ADD CONSTRAINT "account_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;