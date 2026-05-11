-- DropForeignKey
ALTER TABLE "organism_on_account" DROP CONSTRAINT "organism_on_account_account_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_on_account" DROP CONSTRAINT "organism_on_account_organism_id_fkey";

-- AddForeignKey
ALTER TABLE "organism_on_account" ADD CONSTRAINT "organism_on_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_account" ADD CONSTRAINT "organism_on_account_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
