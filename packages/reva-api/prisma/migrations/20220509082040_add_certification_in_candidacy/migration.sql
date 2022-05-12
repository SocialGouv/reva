/*
  Warnings:

  - Added the required column `certification_id` to the `candidacy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "certification_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
