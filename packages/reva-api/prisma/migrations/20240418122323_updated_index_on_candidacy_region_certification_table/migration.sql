-- DropIndex
DROP INDEX "candidacy_region_certification_candidacy_id_region_id_certi_idx";

-- CreateIndex
CREATE INDEX "candidacy_region_certification_certification_id_is_active_c_idx" ON "candidacy_region_certification" ("certification_id", "is_active", "candidacy_id");