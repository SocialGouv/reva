-- DropForeignKey
ALTER TABLE "candidacy_region_certification"
DROP CONSTRAINT "candidacy_region_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_region_certification"
DROP CONSTRAINT "organism_region_certification_certification_id_fkey";

-- AddForeignKey
ALTER TABLE "candidacy_region_certification" ADD CONSTRAINT "candidacy_region_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_region_certification" ADD CONSTRAINT "organism_region_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;