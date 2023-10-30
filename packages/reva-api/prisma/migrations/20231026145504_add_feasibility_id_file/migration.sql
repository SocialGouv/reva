-- AlterTable
ALTER TABLE "feasibility" ADD COLUMN     "ID_file_id" UUID;

-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_ID_file_id_fkey" FOREIGN KEY ("ID_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
