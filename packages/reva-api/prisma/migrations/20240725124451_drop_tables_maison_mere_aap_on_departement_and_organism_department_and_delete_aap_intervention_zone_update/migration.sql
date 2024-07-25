DROP VIEW available_certification_by_department;

DROP VIEW active_organism_by_available_certification_and_department;

-- DropForeignKey
ALTER TABLE "maison_mere_aap_on_departement"
DROP CONSTRAINT "maison_mere_aap_on_departement_departement_id_fkey";

-- DropForeignKey
ALTER TABLE "maison_mere_aap_on_departement"
DROP CONSTRAINT "maison_mere_aap_on_departement_maison_mere_aap_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_department"
DROP CONSTRAINT "organism_department_department_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_department"
DROP CONSTRAINT "organism_department_organism_id_fkey";

-- DropTable
DROP TABLE "maison_mere_aap_on_departement";

-- DropTable
DROP TABLE "organism_department";

DELETE FROM "features"
WHERE
  key = 'AAP_INTERVENTION_ZONE_UPDATE';