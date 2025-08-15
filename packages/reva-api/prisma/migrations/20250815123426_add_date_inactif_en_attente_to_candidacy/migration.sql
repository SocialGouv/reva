-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "date_inactif_en_attente" TIMESTAMPTZ(6),
ALTER COLUMN "derniere_date_activite" SET DEFAULT CURRENT_TIMESTAMP;
