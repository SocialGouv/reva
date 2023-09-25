
-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_certification_authority_id_fkey";


-- AlterTable
ALTER TABLE "feasibility" ALTER COLUMN "certification_authority_id" SET NOT NULL;


-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;
