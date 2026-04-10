-- CreateIndex
CREATE INDEX "certification_level_idx" ON "certification"("level");

-- CreateIndex
CREATE INDEX "certification_on_formacode_certification_id_idx" ON "certification_on_formacode"("certification_id");

-- CreateIndex
CREATE INDEX "organism_typology_idx" ON "organism"("typology");

-- CreateIndex
CREATE INDEX "organism_on_ccn_organism_id_idx" ON "organism_on_ccn"("organism_id");

-- CreateIndex
CREATE INDEX "organism_on_degree_degree_id_idx" ON "organism_on_degree"("degree_id");

-- CreateIndex
CREATE INDEX "organism_on_formacode_organism_id_idx" ON "organism_on_formacode"("organism_id");
