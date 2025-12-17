/*
  Warnings:

  - You are about to drop the `certification_vae_collective_on_organism` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_organism" DROP CONSTRAINT "ccvco_certification_cohorte";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_organism" DROP CONSTRAINT "ccvco_organism";

-- DropTable
DROP TABLE "certification_vae_collective_on_organism";
