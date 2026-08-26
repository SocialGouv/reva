-- CreateTable
CREATE TABLE "sous_compte_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "commanditaire_vae_collective_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "sous_compte_vae_collective_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sous_compte_vae_collective" ADD CONSTRAINT "sous_compte_vae_collective_commanditaire_vae_collective_id_fkey" FOREIGN KEY ("commanditaire_vae_collective_id") REFERENCES "commanditaire_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sous_compte_vae_collective" ADD CONSTRAINT "sous_compte_vae_collective_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
