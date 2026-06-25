CREATE OR REPLACE VIEW maison_mere_aap_vaeco AS
SELECT
    mma.id AS maison_mere_aap_id,
    EXISTS (
        SELECT 1
        FROM organism o
        INNER JOIN cohorte_vae_collective cvc ON cvc.organism_id = o.id
        WHERE o.maison_mere_aap_id = mma.id
    ) AS has_vaeco_candidacies
FROM maison_mere_aap mma;
