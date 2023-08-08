-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_feasibilityFileId_fkey";
-- AlterTable
ALTER TABLE "feasibility"
  RENAME COLUMN "feasibilityFileId" TO feasibility_file_id;
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_feasibility_file_id_fkey" FOREIGN KEY ("feasibility_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;