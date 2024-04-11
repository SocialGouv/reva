/*
  Warnings:

  - A unique constraint covering the columns `[organism_id,degree_id]` on the table `organism_on_degree` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE INDEX "account_email_idx" ON "account"("email");

-- CreateIndex
CREATE INDEX "account_organism_id_idx" ON "account"("organism_id");

-- CreateIndex
CREATE INDEX "account_certification_authority_id_idx" ON "account"("certification_authority_id");

-- CreateIndex
CREATE INDEX "candidacy_organism_id_idx" ON "candidacy"("organism_id");

-- CreateIndex
CREATE INDEX "candidacy_candidate_id_idx" ON "candidacy"("candidate_id");

-- CreateIndex
CREATE INDEX "candidacy_department_id_idx" ON "candidacy"("department_id");

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_candidacy_id_is_active_idx" ON "candidacy_candidacy_status"("candidacy_id", "is_active");

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_candidacy_id_status_is_active_idx" ON "candidacy_candidacy_status"("candidacy_id", "status", "is_active");

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_candidacy_id_status_idx" ON "candidacy_candidacy_status"("candidacy_id", "status");

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_status_is_active_idx" ON "candidacy_candidacy_status"("status", "is_active");

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_candidacy_id_idx" ON "candidacy_candidacy_status"("candidacy_id");

-- CreateIndex
CREATE INDEX "candidacy_log_candidacy_id_idx" ON "candidacy_log"("candidacy_id");

-- CreateIndex
CREATE INDEX "candidacy_region_certification_candidacy_id_region_id_certi_idx" ON "candidacy_region_certification"("candidacy_id", "region_id", "certification_id", "is_active");

-- CreateIndex
CREATE INDEX "candidacy_region_certification_candidacy_id_certification_i_idx" ON "candidacy_region_certification"("candidacy_id", "certification_id", "is_active");

-- CreateIndex
CREATE INDEX "certification_type_diplome_id_idx" ON "certification"("type_diplome_id");

-- CreateIndex
CREATE INDEX "certification_authority_local_account_account_id_idx" ON "certification_authority_local_account"("account_id");

-- CreateIndex
CREATE INDEX "certification_authority_local_account_certification_authori_idx" ON "certification_authority_local_account"("certification_authority_id");

-- CreateIndex
CREATE INDEX "department_region_id_idx" ON "department"("region_id");

-- CreateIndex
CREATE INDEX "dossier_de_validation_candidacy_id_is_active_idx" ON "dossier_de_validation"("candidacy_id", "is_active");

-- CreateIndex
CREATE INDEX "dossier_de_validation_certification_authority_id_is_active_idx" ON "dossier_de_validation"("certification_authority_id", "is_active");

-- CreateIndex
CREATE INDEX "experience_candidacy_id_idx" ON "experience"("candidacy_id");

-- CreateIndex
CREATE INDEX "feasibility_candidacy_id_is_active_idx" ON "feasibility"("candidacy_id", "is_active");

-- CreateIndex
CREATE INDEX "feasibility_certification_authority_id_is_active_idx" ON "feasibility"("certification_authority_id", "is_active");

-- CreateIndex
CREATE INDEX "jury_candidacy_id_is_active_idx" ON "jury"("candidacy_id", "is_active");

-- CreateIndex
CREATE INDEX "jury_certification_authority_id_is_active_idx" ON "jury"("certification_authority_id", "is_active");

-- CreateIndex
CREATE INDEX "maison_mere_aap_typologie_idx" ON "maison_mere_aap"("typologie");

-- CreateIndex
CREATE INDEX "maison_mere_aap_gestionnaire_account_id_idx" ON "maison_mere_aap"("gestionnaire_account_id");

-- CreateIndex
CREATE INDEX "maison_mere_aap_on_departement_maison_mere_aap_id_departeme_idx" ON "maison_mere_aap_on_departement"("maison_mere_aap_id", "departement_id", "est_a_distance", "est_sur_place");

-- CreateIndex
CREATE INDEX "organism_typology_is_active_idx" ON "organism"("typology", "is_active");

-- CreateIndex
CREATE INDEX "organism_maison_mere_aap_id_idx" ON "organism"("maison_mere_aap_id");

-- CreateIndex
CREATE UNIQUE INDEX "organism_on_degree_organism_id_degree_id_key" ON "organism_on_degree"("organism_id", "degree_id");
