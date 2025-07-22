-- DropForeignKey
ALTER TABLE "certification_vae_collective" DROP CONSTRAINT "certification_vae_collective_cohorte_vae_collective_id_fkey";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" DROP CONSTRAINT "ccvco_certification_cohorte";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_organism" DROP CONSTRAINT "ccvco_certification_cohorte";

-- AddForeignKey
ALTER TABLE "certification_vae_collective" ADD CONSTRAINT "certification_vae_collective_cohorte_vae_collective_id_fkey" FOREIGN KEY ("cohorte_vae_collective_id") REFERENCES "cohorte_vae_collective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_organism" ADD CONSTRAINT "ccvco_certification_cohorte" FOREIGN KEY ("certification_cohorte_vae_collective_id") REFERENCES "certification_vae_collective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" ADD CONSTRAINT "ccvco_certification_cohorte" FOREIGN KEY ("certification_cohorte_vae_collective_id") REFERENCES "certification_vae_collective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
