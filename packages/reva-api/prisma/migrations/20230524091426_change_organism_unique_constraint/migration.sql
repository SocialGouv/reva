DROP INDEX "organism_label_key";
CREATE UNIQUE INDEX "organism_siret_typology_key" ON "organism"("siret", "typology");
