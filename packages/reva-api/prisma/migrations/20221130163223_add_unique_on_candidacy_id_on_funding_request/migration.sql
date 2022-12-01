/*
  Warnings:

  - A unique constraint covering the columns `[candidacy_id]` on the table `funding_request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "funding_request_candidacy_id_key" ON "funding_request"("candidacy_id");
