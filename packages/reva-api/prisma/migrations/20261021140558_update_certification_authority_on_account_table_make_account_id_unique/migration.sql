/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `certification_authority_on_account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "certification_authority_on_account_certification_authority__key";

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_on_account_account_id_key" ON "certification_authority_on_account"("account_id");
