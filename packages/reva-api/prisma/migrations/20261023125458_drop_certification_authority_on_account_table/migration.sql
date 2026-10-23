/*
  Warnings:

  - You are about to drop the `certification_authority_on_account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_authority_on_account" DROP CONSTRAINT "ca_on_account_account";

-- DropForeignKey
ALTER TABLE "certification_authority_on_account" DROP CONSTRAINT "ca_on_account_ca";

-- DropTable
DROP TABLE "certification_authority_on_account";
