-- CreateIndex
CREATE INDEX "idx_candidate_lastname_trgm" ON "candidate" USING GIN ("lastname" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_firstname_trgm" ON "candidate" USING GIN ("firstname" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_given_name_trgm" ON "candidate" USING GIN ("given_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_email_trgm" ON "candidate" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_phone_trgm" ON "candidate" USING GIN ("phone" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_firstname2_trgm" ON "candidate" USING GIN ("firstname2" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_firstname3_trgm" ON "candidate" USING GIN ("firstname3" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_candidate_middle_names_trgm" ON "candidate" USING GIN ("middle_names" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_certification_label_trgm" ON "certification" USING GIN ("label" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_certification_rncp_type_diplome_trgm" ON "certification" USING GIN ("rncp_type_diplome" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_department_label_trgm" ON "department" USING GIN ("label" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_organism_label_trgm" ON "organism" USING GIN ("label" gin_trgm_ops);
