-- DropForeignKey
ALTER TABLE "candidacy_region_certification" DROP CONSTRAINT "candidacy_region_certification_certification_id_fkey";
-- AddForeignKey
ALTER TABLE "candidacy_region_certification"
ADD CONSTRAINT "candidacy_region_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;