/*
  Warnings:

  - A unique constraint covering the columns `[gestionnaire_account_id]` on the table `maison_mere_aap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "maison_mere_aap_gestionnaire_account_id_key" ON "maison_mere_aap"("gestionnaire_account_id");
