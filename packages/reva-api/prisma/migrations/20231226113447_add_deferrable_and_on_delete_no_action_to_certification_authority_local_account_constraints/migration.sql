-- DropForeignKey
ALTER TABLE "certification_authority_local_account" DROP CONSTRAINT "certification_authority_local_account_certification_author_fkey";

-- DropForeignKey
ALTER TABLE "certification_authority_local_account_on_certification" DROP CONSTRAINT "calaoc_certification";

-- DropForeignKey
ALTER TABLE "certification_authority_local_account_on_department" DROP CONSTRAINT "calaoc_department";

-- AddForeignKey
ALTER TABLE "certification_authority_local_account" ADD CONSTRAINT "certification_authority_local_account_certification_author_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_certification" ADD CONSTRAINT "calaoc_certification" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_department" ADD CONSTRAINT "calaoc_department" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE CASCADE;