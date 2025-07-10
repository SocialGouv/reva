-- AlterTable
ALTER TABLE "commanditaire_vae_collective" ADD COLUMN     "gestionnaire_account_id" UUID;

-- AddForeignKey
ALTER TABLE "commanditaire_vae_collective" ADD CONSTRAINT "commanditaire_vae_collective_gestionnaire_account_id_fkey" FOREIGN KEY ("gestionnaire_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
