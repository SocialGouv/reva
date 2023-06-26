/*
  Warnings:

  - You are about to drop the `profession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rome_certification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "profession" DROP CONSTRAINT "profession_rome_id_fkey";

-- DropForeignKey
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_rome_id_fkey";

-- DropTable
DROP TABLE "profession";

-- DropTable
DROP TABLE "rome";

-- DropTable
DROP TABLE "rome_certification";