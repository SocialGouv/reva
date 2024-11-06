/*
  Warnings:

  - You are about to drop the `admissibility_fvae` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admissibility_fvae" DROP CONSTRAINT "admissibility_fvae_candidacy_id_fkey";

-- DropTable
DROP TABLE "admissibility_fvae";
