-- DropForeignKey
ALTER TABLE "dematerialized_feasibility_file" DROP CONSTRAINT "dematerialized_feasibility_file_feasibility_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility_uploaded_pdf" DROP CONSTRAINT "feasibility_uploaded_pdf_feasibility_id_fkey";

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
