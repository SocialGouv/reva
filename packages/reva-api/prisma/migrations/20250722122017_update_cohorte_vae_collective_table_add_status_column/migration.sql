-- CreateEnum
CREATE TYPE "CohorteVaeCollectiveStatus" AS ENUM ('BROUILLON', 'PUBLIE');

-- AlterTable
ALTER TABLE "cohorte_vae_collective"
ADD COLUMN "status" "CohorteVaeCollectiveStatus" NOT NULL DEFAULT 'BROUILLON';

-- Update existing records to set status to PUBLIE if codeInscription is not null
UPDATE "cohorte_vae_collective"
SET
    "status" = 'PUBLIE'
WHERE
    "code_inscription" IS NOT NULL;