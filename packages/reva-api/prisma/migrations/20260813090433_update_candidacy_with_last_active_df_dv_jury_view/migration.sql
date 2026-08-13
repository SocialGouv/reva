DROP VIEW candidacy_with_last_active_df_dv_jury;
CREATE OR REPLACE VIEW candidacy_with_last_active_df_dv_jury AS
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
    ) AS jury_id,
    COALESCE(
        (
            SELECT dff.sent_to_candidate_at > f.decision_sent_at
            FROM feasibility f
            LEFT JOIN dematerialized_feasibility_file dff ON dff.feasibility_id = f.id
            WHERE f.candidacy_id = c.id
              AND f.is_active = true
              AND f.decision = 'INCOMPLETE'
              AND dff.sent_to_candidate_at IS NOT NULL
              AND (dff.candidate_confirmation_at IS NULL OR dff.candidate_confirmation_at < f.decision_sent_at)
            ORDER BY f.created_at DESC
            LIMIT 1
        ),
        false
    ) AS incomplete_dff_is_sent_to_candidate,
    COALESCE(
        (
            SELECT dff.candidate_confirmation_at > f.decision_sent_at
            FROM feasibility f
            LEFT JOIN dematerialized_feasibility_file dff ON dff.feasibility_id = f.id
            WHERE f.candidacy_id = c.id
              AND f.is_active = true
              AND f.decision = 'INCOMPLETE'
              AND dff.candidate_confirmation_at IS NOT NULL
              AND dff.sworn_statement_file_id IS NOT NULL
            ORDER BY f.created_at DESC
            LIMIT 1
        ),
        false
    ) AS incomplete_dff_is_confirmed_by_candidate,
    COALESCE(
        (
            SELECT dff.candidate_confirmation_at > f.decision_sent_at
            FROM feasibility f
            LEFT JOIN dematerialized_feasibility_file dff ON dff.feasibility_id = f.id
            WHERE f.candidacy_id = c.id
              AND f.is_active = true
              AND f.decision = 'INCOMPLETE'
              AND dff.candidate_confirmation_at IS NOT NULL
              AND dff.sworn_statement_file_id IS NULL
            ORDER BY f.created_at DESC
            LIMIT 1
        ),
        false
    ) AS incomplete_dff_is_partially_confirmed_by_candidate
FROM candidacy c;
