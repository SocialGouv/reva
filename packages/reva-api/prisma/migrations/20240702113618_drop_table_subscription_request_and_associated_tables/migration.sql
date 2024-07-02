/*
  Warnings:

  - You are about to drop the `subscription_request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_request_department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_request_on_ccn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_request_on_domaine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription_request_department" DROP CONSTRAINT "subscription_request_department_department_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_department" DROP CONSTRAINT "subscription_request_department_subscription_request_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_ccn" DROP CONSTRAINT "subscription_request_on_ccn_ccn_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_ccn" DROP CONSTRAINT "subscription_request_on_ccn_subscription_request_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_domaine" DROP CONSTRAINT "subscription_request_on_domaine_domaine_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_domaine" DROP CONSTRAINT "subscription_request_on_domaine_subscription_request_id_fkey";

-- DropTable
DROP TABLE "subscription_request";

-- DropTable
DROP TABLE "subscription_request_department";

-- DropTable
DROP TABLE "subscription_request_on_ccn";

-- DropTable
DROP TABLE "subscription_request_on_domaine";

-- DropEnum
DROP TYPE "SubscriptionOrganismTypology";
