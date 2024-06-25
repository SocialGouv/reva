/*
  Warnings:

  - A unique constraint covering the columns `[sworn_statement_file_id]` on the table `dematerialized_feasibility_file` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "sworn_statement_file_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "dematerialized_feasibility_file_sworn_statement_file_id_key" ON "dematerialized_feasibility_file"("sworn_statement_file_id");

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_sworn_statement_file_id_fkey" FOREIGN KEY ("sworn_statement_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
