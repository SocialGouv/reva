-- DropForeignKey
ALTER TABLE "certification_authority_on_certification" DROP CONSTRAINT "certification_authority_on_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "certification_authority_on_department" DROP CONSTRAINT "certification_authority_on_department_department_id_fkey";

-- AddForeignKey
ALTER TABLE "certification_authority_on_department" ADD CONSTRAINT "certification_authority_on_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_on_certification" ADD CONSTRAINT "certification_authority_on_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;
