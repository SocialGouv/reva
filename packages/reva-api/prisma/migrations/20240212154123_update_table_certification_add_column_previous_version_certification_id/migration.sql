/*
  Warnings:

  - A unique constraint covering the columns `[previous_version_certification_id]` on the table `certification` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "previous_version_certification_id" UUID;
-- CreateIndex
CREATE UNIQUE INDEX "certification_previous_version_certification_id_key" ON "certification"("previous_version_certification_id");

-- AddForeignKey
ALTER TABLE "certification" ADD CONSTRAINT "certification_previous_version_certification_id_fkey" FOREIGN KEY ("previous_version_certification_id") REFERENCES "certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

