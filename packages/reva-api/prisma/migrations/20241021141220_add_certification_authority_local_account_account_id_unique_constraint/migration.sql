/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `certification_authority_local_account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_local_account_account_id_key" ON "certification_authority_local_account"("account_id");
