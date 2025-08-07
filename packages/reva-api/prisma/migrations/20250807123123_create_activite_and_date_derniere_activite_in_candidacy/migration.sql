-- CreateEnum
CREATE TYPE "ActiviteStatut" AS ENUM ('ACTIF', 'INACTIF_EN_ATTENTE', 'INACTIF_CONFIRME');

-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "activite" "ActiviteStatut" NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "derniere_date_activite" TIMESTAMPTZ(6);
