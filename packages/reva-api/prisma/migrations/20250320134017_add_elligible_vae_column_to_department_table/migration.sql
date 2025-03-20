ALTER TABLE "department"
ADD COLUMN "elligible_vae" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "department"
ALTER COLUMN "elligible_vae"
DROP DEFAULT;