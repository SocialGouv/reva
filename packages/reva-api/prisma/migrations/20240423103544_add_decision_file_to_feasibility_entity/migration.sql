-- AlterTable
ALTER TABLE "feasibility" ADD COLUMN     "decision_file_id" UUID;

-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_decision_file_id_fkey" FOREIGN KEY ("decision_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
