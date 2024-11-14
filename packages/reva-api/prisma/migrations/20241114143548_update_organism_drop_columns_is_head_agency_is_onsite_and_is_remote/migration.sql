/*
  Warnings:

  - You are about to drop the column `is_head_agency` on the `organism` table. All the data in the column will be lost.
  - You are about to drop the column `is_onsite` on the `organism` table. All the data in the column will be lost.
  - You are about to drop the column `is_remote` on the `organism` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organism" DROP COLUMN "is_head_agency",
DROP COLUMN "is_onsite",
DROP COLUMN "is_remote";
