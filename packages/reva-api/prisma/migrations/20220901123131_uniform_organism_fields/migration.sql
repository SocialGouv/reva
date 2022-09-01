
-- DropIndex
DROP INDEX "organism_contact_administratif_key";

-- Add columns
ALTER TABLE "organism" 
  ADD COLUMN     "address" TEXT DEFAULT '' NOT NULL,
  ADD COLUMN     "contact_administrative_email" VARCHAR(255) DEFAULT '' NOT NULL,
  ADD COLUMN     "zip" VARCHAR(5) DEFAULT '' NOT NULL;


-- Copy current content
UPDATE "organism"
  SET "address" = "adress",
      "zip" = "cp",
      "contact_administrative_email" = "contact_administratif";

-- Remove old columns and default
ALTER TABLE "organism" 
  DROP COLUMN "adress",
  DROP COLUMN "contact_administratif",
  DROP COLUMN "cp",
  ALTER COLUMN "address" DROP DEFAULT,
  ALTER COLUMN "contact_administrative_email" DROP DEFAULT,
  ALTER COLUMN "zip" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "organism_contact_administrative_email_key" ON "organism"("contact_administrative_email");
