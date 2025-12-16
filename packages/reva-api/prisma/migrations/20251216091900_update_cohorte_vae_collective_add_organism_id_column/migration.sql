-- AlterTable
ALTER TABLE "cohorte_vae_collective" ADD COLUMN     "organism_id" UUID;

-- AddForeignKey
ALTER TABLE "cohorte_vae_collective" ADD CONSTRAINT "cohorte_vae_collective_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE SET NULL ON UPDATE CASCADE;
