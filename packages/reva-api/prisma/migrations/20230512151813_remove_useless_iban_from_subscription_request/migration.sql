/*
  Warnings:

  - You are about to drop the column `company_bic` on the `subscription_request` table. All the data in the column will be lost.
  - You are about to drop the column `company_iban` on the `subscription_request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription_request" DROP COLUMN "company_bic",
DROP COLUMN "company_iban";
