/*
  Warnings:

  - A unique constraint covering the columns `[bloc_id]` on the table `competency` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "competency_bloc_id_key" ON "competency"("bloc_id");
