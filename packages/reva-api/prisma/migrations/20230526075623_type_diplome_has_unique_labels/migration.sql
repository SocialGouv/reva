/*
  Warnings:

  - You are about to drop the column `searchable_text` on the `certification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `type_diplome` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "certification" DROP COLUMN "searchable_text";

-- CreateIndex
CREATE UNIQUE INDEX "type_diplome_label_key" ON "type_diplome"("label");
