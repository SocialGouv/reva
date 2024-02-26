-- AlterTable
ALTER TABLE "maison_mere_aap" ADD COLUMN     "phone" VARCHAR(50);

UPDATE maison_mere_aap mm1 SET phone = organism.contact_administrative_phone
FROM maison_mere_aap mm2
JOIN (
     SELECT *
     FROM organism
     WHERE maison_mere_aap_id IN (
        SELECT organism.maison_mere_aap_id
        FROM organism
        GROUP BY organism.maison_mere_aap_id HAVING COUNT(*) = 1
)
) AS organism
ON mm2.id = organism.maison_mere_aap_id
WHERE mm1.id = mm2.id;
