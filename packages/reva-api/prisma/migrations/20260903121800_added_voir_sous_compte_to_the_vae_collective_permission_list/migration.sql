-- AlterEnum
ALTER TYPE "PermissionVaeCollective" ADD VALUE 'VOIR_SOUS_COMPTE';

-- AddForeignKey
ALTER TABLE "permission_specific_to_sous_compte_vae_collective" ADD CONSTRAINT "permission_specific_to_sous_compte_vae_collective_sous_com_fkey" FOREIGN KEY ("sous_compte_vae_collective_id") REFERENCES "sous_compte_vae_collective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;