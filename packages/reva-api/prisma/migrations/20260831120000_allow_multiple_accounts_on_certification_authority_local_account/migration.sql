-- AlterTable
ALTER TABLE "account" ADD COLUMN "certification_authority_local_account_id" UUID;

-- Backfill existing 1:1 links
UPDATE "account" AS a
SET "certification_authority_local_account_id" = cala.id
FROM "certification_authority_local_account" AS cala
WHERE cala.account_id = a.id;

-- CreateIndex
CREATE INDEX "account_certification_authority_local_account_id_idx" ON "account"("certification_authority_local_account_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_certification_authority_local_account_id_fkey" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "certification_authority_local_account" DROP CONSTRAINT "certification_authority_local_account_account_id_fkey";

-- DropIndex
DROP INDEX "certification_authority_local_account_account_id_key";

-- DropIndex
DROP INDEX "certification_authority_local_account_account_id_idx";

-- AlterTable
ALTER TABLE "certification_authority_local_account" DROP COLUMN "account_id";
