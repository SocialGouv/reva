-- DropForeignKey
ALTER TABLE "certification_on_ccn" DROP CONSTRAINT "certification_on_ccn_certification_id_fkey";
-- DropForeignKey
ALTER TABLE "certification_on_domaine" DROP CONSTRAINT "certification_on_domaine_certification_id_fkey";
-- DropForeignKey
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_rome_id_fkey";
-- AddForeignKey
ALTER TABLE "rome_certification"
ADD CONSTRAINT "rome_certification_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "certification_on_domaine"
ADD CONSTRAINT "certification_on_domaine_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "certification_on_ccn"
ADD CONSTRAINT "certification_on_ccn_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;