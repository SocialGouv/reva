/*
  Warnings:

  - A unique constraint covering the columns `[rncp_id]` on the table `certification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "certification_rncp_id_key" ON "certification"("rncp_id");
