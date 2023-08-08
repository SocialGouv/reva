-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_otherFileId_fkey";
-- AlterTable
ALTER TABLE "feasibility"
    RENAME COLUMN "otherFileId" TO "documentary_proof_file_id";
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_documentary_proof_file_id_fkey" FOREIGN KEY ("documentary_proof_file_id") REFERENCES "file"("id") ON DELETE
SET NULL ON UPDATE CASCADE;