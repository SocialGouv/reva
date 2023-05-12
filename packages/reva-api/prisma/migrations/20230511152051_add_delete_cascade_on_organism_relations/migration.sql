-- DropForeignKey
ALTER TABLE "organism_on_ccn" DROP CONSTRAINT "organism_on_ccn_organism_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_on_domaine" DROP CONSTRAINT "organism_on_domaine_organism_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_ccn" DROP CONSTRAINT "subscription_request_on_ccn_subscription_request_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_request_on_domaine" DROP CONSTRAINT "subscription_request_on_domaine_subscription_request_id_fkey";

-- AddForeignKey
ALTER TABLE "subscription_request_on_domaine" ADD CONSTRAINT "subscription_request_on_domaine_subscription_request_id_fkey" FOREIGN KEY ("subscription_request_id") REFERENCES "subscription_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_domaine" ADD CONSTRAINT "organism_on_domaine_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_ccn" ADD CONSTRAINT "organism_on_ccn_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_on_ccn" ADD CONSTRAINT "subscription_request_on_ccn_subscription_request_id_fkey" FOREIGN KEY ("subscription_request_id") REFERENCES "subscription_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
