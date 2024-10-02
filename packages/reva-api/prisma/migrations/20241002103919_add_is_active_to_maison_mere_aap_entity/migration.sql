-- AlterTable
ALTER TABLE "maison_mere_aap" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;

UPDATE
  maison_mere_aap
SET
  is_active = organism_subquery.is_active
FROM
  (
    SELECT
      	DISTINCT maison_mere_aap_id, is_active
    FROM
    	organism
    WHERE organism.is_active = 'true' AND organism.maison_mere_aap_id IS NOT NULL
  ) AS organism_subquery
WHERE
  maison_mere_aap.id = organism_subquery.maison_mere_aap_id;

UPDATE
  organism
SET
  is_active = maison_mere_aap.is_active
FROM
  maison_mere_aap
WHERE
  organism.maison_mere_aap_id = maison_mere_aap.id;
