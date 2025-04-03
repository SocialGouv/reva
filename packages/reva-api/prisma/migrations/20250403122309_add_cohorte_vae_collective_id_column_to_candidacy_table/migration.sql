-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "cohorte_vae_collective_id" UUID;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_cohorte_vae_collective_id_fkey" FOREIGN KEY ("cohorte_vae_collective_id") REFERENCES "cohorte_vae_collective"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
