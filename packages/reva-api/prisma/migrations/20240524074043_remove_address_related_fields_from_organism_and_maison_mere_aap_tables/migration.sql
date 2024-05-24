/*
  Warnings:

  - You are about to drop the column `adresse` on the `maison_mere_aap` table. All the data in the column will be lost.
  - You are about to drop the column `code_postal` on the `maison_mere_aap` table. All the data in the column will be lost.
  - You are about to drop the column `ville` on the `maison_mere_aap` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `organism` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `organism` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `organism` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "maison_mere_aap" DROP COLUMN "adresse",
DROP COLUMN "code_postal",
DROP COLUMN "ville";

-- AlterTable
ALTER TABLE "organism" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "zip";
