/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `maison_mere_aap_on_account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "maison_mere_aap_on_account_account_id_key" ON "maison_mere_aap_on_account"("account_id");
