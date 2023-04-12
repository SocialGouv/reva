/*
  Warnings:

  - Made the column `company_address` on table `subscription_request` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_city` on table `subscription_request` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_zipcode` on table `subscription_request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subscription_request" ALTER COLUMN "company_address" SET NOT NULL,
ALTER COLUMN "company_address" SET DEFAULT E'',
ALTER COLUMN "company_city" SET NOT NULL,
ALTER COLUMN "company_city" SET DEFAULT E'',
ALTER COLUMN "company_zipcode" SET NOT NULL,
ALTER COLUMN "company_zipcode" SET DEFAULT E'';
