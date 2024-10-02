-- AlterTable
ALTER TABLE "maison_mere_aap" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;

UPDATE
  maison_mere_aap
SET
  is_active = 'true'
FROM
  (
	SELECT
		DISTINCT(maison_mere_aap_id),
	    COUNT(id) as total_count,
	    COUNT(id) FILTER (WHERE organism.is_active = 'true') as active_count
	FROM
		organism
	WHERE organism.maison_mere_aap_id IS NOT NULL
	GROUP BY maison_mere_aap_id
  ) AS organism_subquery
WHERE
  maison_mere_aap.id = organism_subquery.maison_mere_aap_id AND organism_subquery.total_count = organism_subquery.active_count;

UPDATE
  organism
SET
  is_active = maison_mere_aap.is_active
FROM
  maison_mere_aap
WHERE
  organism.maison_mere_aap_id = maison_mere_aap.id;
