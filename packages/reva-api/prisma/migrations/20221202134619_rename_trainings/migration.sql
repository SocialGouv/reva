/*
  Warnings:

  - You are about to drop the column `additional_cost` on the `funding_request` table. All the data in the column will be lost.
  - You are about to drop the column `additional_hour_count` on the `funding_request` table. All the data in the column will be lost.
  - You are about to drop the column `other_training_cost` on the `funding_request` table. All the data in the column will be lost.
  - Added the required column `mandatory_training_cost` to the `funding_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mandatory_training_hour_count` to the `funding_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "funding_request" DROP COLUMN "additional_cost",
DROP COLUMN "additional_hour_count",
DROP COLUMN "other_training_cost",
ADD COLUMN     "mandatory_training_cost" INTEGER NOT NULL,
ADD COLUMN     "mandatory_training_hour_count" INTEGER NOT NULL;
