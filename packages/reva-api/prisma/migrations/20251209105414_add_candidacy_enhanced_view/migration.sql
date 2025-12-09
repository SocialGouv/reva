CREATE OR REPLACE VIEW candidacy_enhanced AS
SELECT
    c.id AS candidacy_id,
    (
        SELECT f.id
        FROM feasibility f
        WHERE f.candidacy_id = c.id
          AND f.is_active = true
        ORDER BY f.created_at DESC
        LIMIT 1
    ) AS feasibility_id,
    (
        SELECT dv.id
        FROM dossier_de_validation dv
        WHERE dv.candidacy_id = c.id
          AND dv.is_active = true
        ORDER BY dv.created_at DESC
        LIMIT 1
    ) AS dossier_de_validation_id,
    (
        SELECT j.id
        FROM jury j
        WHERE j.candidacy_id = c.id
          AND j.is_active = true
        ORDER BY j.created_at DESC
        LIMIT 1
    ) AS jury_id
FROM candidacy c;

