/*
  Warnings:

  - You are about to drop the column `expires_at` on the `certification` table. All the data in the column will be lost.
  - Made the column `rncp_expires_at` on table `certification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "certification" DROP COLUMN "expires_at",
ALTER COLUMN "rncp_expires_at" SET NOT NULL;
