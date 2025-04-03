/*
  Warnings:

  - Added the required column `projet_vae_collective_id` to the `cohorte_vae_collective` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commanditaire_vae_collective_id` to the `projet_vae_collective` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cohorte_vae_collective" ADD COLUMN     "projet_vae_collective_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "projet_vae_collective" ADD COLUMN     "commanditaire_vae_collective_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "projet_vae_collective" ADD CONSTRAINT "projet_vae_collective_commanditaire_vae_collective_id_fkey" FOREIGN KEY ("commanditaire_vae_collective_id") REFERENCES "commanditaire_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorte_vae_collective" ADD CONSTRAINT "cohorte_vae_collective_projet_vae_collective_id_fkey" FOREIGN KEY ("projet_vae_collective_id") REFERENCES "projet_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
