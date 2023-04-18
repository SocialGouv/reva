/*
 Warnings:
 
 - Added the required column `typology` to the `subscription_request` table without a default value. This is not possible if the table is not empty.
 
 */
-- CreateEnum
CREATE TYPE "OrganismTypology" AS ENUM ('experimentation', 'generaliste');
-- AlterTable
ALTER TABLE "subscription_request"
ADD COLUMN "typology" "OrganismTypology" NOT NULL DEFAULT 'experimentation';
ALTER TABLE "subscription_request"
ALTER COLUMN "typology" DROP DEFAULT;