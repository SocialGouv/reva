/*
  Warnings:

  - You are about to drop the column `organism_informations_commerciales_id` on the `organism` table. All the data in the column will be lost.
  - You are about to drop the `organism_informations_commerciales` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "organism_informations_commerciales" DROP CONSTRAINT "organism_informations_commerciales_organism_id_fkey";

-- AlterTable
ALTER TABLE "organism" DROP COLUMN "organism_informations_commerciales_id";

-- DropTable
DROP TABLE "organism_informations_commerciales";
