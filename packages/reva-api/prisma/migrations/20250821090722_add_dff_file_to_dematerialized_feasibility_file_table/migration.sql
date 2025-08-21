-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "dff_file_id" UUID;

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_dff_file_id_fkey" FOREIGN KEY ("dff_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
