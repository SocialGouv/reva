-- AlterTable
ALTER TABLE "maison_mere_aap"
ALTER COLUMN "is_mcf_compatible"
DROP NOT NULL,
ALTER COLUMN "is_mcf_compatible"
DROP DEFAULT;

UPDATE "maison_mere_aap"
SET
    "is_mcf_compatible" = NULL;