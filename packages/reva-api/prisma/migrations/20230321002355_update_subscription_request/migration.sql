/*
  Warnings:

  - You are about to drop the column `company_billing_address` on the `subscription_request` table. All the data in the column will be lost.
  - Added the required column `company_billing_contact_firstname` to the `subscription_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_billing_contact_lastname` to the `subscription_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_billing_phone_number` to the `subscription_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_city` to the `subscription_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_zipcode` to the `subscription_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_upload_spooler" RENAME CONSTRAINT "FileUploadSpooler_pkey" TO "file_upload_spooler_pkey";

-- AlterTable
ALTER TABLE "subscription_request" RENAME CONSTRAINT "SubscriptionRequest_pkey" TO "subscription_request_pkey";
TRUNCATE TABLE "subscription_request";
ALTER TABLE "subscription_request"
DROP COLUMN "company_billing_address",
ADD COLUMN     "company_billing_contact_firstname" VARCHAR(100) NOT NULL,
ADD COLUMN     "company_billing_contact_lastname" VARCHAR(255) NOT NULL,
ADD COLUMN     "company_billing_phone_number" VARCHAR(50) NOT NULL,
ALTER COLUMN   "company_address" DROP NOT NULL,
ADD COLUMN     "company_city" VARCHAR(100),
ADD COLUMN     "company_zipcode" VARCHAR(5);
