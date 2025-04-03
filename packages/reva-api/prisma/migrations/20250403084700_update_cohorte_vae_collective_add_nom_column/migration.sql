/*
  Warnings:

  - Added the required column `nom` to the `cohorte_vae_collective` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cohorte_vae_collective" ADD COLUMN     "nom" VARCHAR(255) NOT NULL;
