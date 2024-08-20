-- DropForeignKey
ALTER TABLE "certification" DROP CONSTRAINT "certification_certification_authority_structure_id_fkey";

-- AlterTable
ALTER TABLE "certification" ALTER COLUMN "certification_authority_structure_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "certification" ADD CONSTRAINT "certification_certification_authority_structure_id_fkey" FOREIGN KEY ("certification_authority_structure_id") REFERENCES "certification_authority_structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
