
-- DropIndex
DROP INDEX "organism_contact_administratif_key";

-- Rename old columns and default
ALTER TABLE "organism" 
  RENAME COLUMN "adress" TO "address";
ALTER TABLE "organism" 
  RENAME COLUMN "contact_administratif" TO "contact_administrative_email";
ALTER TABLE "organism" 
  RENAME COLUMN "cp" TO "zip";

-- CreateIndex
CREATE UNIQUE INDEX "organism_contact_administrative_email_key" ON "organism"("contact_administrative_email");
