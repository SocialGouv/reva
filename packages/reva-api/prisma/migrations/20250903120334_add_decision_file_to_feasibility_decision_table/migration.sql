-- AlterTable
ALTER TABLE "feasibility_decision" ADD COLUMN     "decision_file_id" UUID;

-- AddForeignKey
ALTER TABLE "feasibility_decision" ADD CONSTRAINT "feasibility_decision_decision_file_id_fkey" FOREIGN KEY ("decision_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
