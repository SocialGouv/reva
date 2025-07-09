-- AlterTable
ALTER TABLE "cohorte_vae_collective"
ADD COLUMN "commanditaire_vae_collective_id" UUID;

UPDATE "cohorte_vae_collective"
SET
  "commanditaire_vae_collective_id" = (
    SELECT
      "commanditaire_vae_collective_id"
    FROM
      "projet_vae_collective"
    WHERE
      "projet_vae_collective"."id" = "cohorte_vae_collective"."projet_vae_collective_id"
  );

ALTER TABLE "cohorte_vae_collective"
ALTER COLUMN "commanditaire_vae_collective_id"
SET
  NOT NULL;

-- AddForeignKey
ALTER TABLE "cohorte_vae_collective" ADD CONSTRAINT "cohorte_vae_collective_commanditaire_vae_collective_id_fkey" FOREIGN KEY ("commanditaire_vae_collective_id") REFERENCES "commanditaire_vae_collective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "cohorte_vae_collective"
DROP CONSTRAINT "cohorte_vae_collective_projet_vae_collective_id_fkey";

-- DropForeignKey
ALTER TABLE "projet_vae_collective"
DROP CONSTRAINT "projet_vae_collective_commanditaire_vae_collective_id_fkey";

-- AlterTable
ALTER TABLE "cohorte_vae_collective"
DROP COLUMN "projet_vae_collective_id";

-- DropTable
DROP TABLE "projet_vae_collective";