-- AlterTable
ALTER TABLE "reorientation_reason" DROP COLUMN "deleted_at",
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;

UPDATE "reorientation_reason" SET disabled = true WHERE label = 'Architecte de parcours neutre';