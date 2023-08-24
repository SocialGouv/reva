-- AlterTable
ALTER TABLE "reorientation_reason" ADD COLUMN     "deleted_at" TIMESTAMPTZ(6);

UPDATE "reorientation_reason" SET deleted_at = NOW()::timestamp WHERE label = 'Architecte de parcours neutre';