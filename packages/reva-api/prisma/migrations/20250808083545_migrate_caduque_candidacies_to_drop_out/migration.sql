BEGIN;

WITH reason AS (
  SELECT id
  FROM drop_out_reason
  WHERE label = 'Inactivité depuis 6 mois'
  LIMIT 1
),
caduque AS (
  SELECT c.id, c.status
  FROM candidacy AS c
  WHERE
    -- no existing dropout
    NOT EXISTS (
      SELECT 1
      FROM candidacy_drop_out AS cdo
      WHERE cdo.candidacy_id = c.id
    )
    -- no pending contestation
    AND NOT EXISTS (
      SELECT 1
      FROM candidacy_contestation_caducite AS ccc
      WHERE ccc.candidacy_id = c.id
        AND ccc.certification_authority_contestation_decision = 'DECISION_PENDING'
    )
    -- admissible feasibility
    AND EXISTS (
      SELECT 1
      FROM feasibility AS f
      WHERE f.candidacy_id = c.id
        AND f.is_active = TRUE
        AND f.decision = 'ADMISSIBLE'
    )
    -- statuses logic
    AND (
      (
        c.status IN ('DEMANDE_PAIEMENT_ENVOYEE')
        AND EXISTS (
          SELECT 1
          FROM dossier_de_validation AS ddv
          WHERE ddv.candidacy_id = c.id
            AND ddv.is_active = TRUE
            AND ddv.decision = 'INCOMPLETE'
        )
      )
      OR c.status IN (
        'DOSSIER_FAISABILITE_RECEVABLE',
        'DOSSIER_DE_VALIDATION_SIGNALE',
        'DEMANDE_FINANCEMENT_ENVOYE'
      )
    )
    -- inactivity threshold
    AND DATE_PART('day', NOW() - c.last_activity_date) > 183
),
updated AS (
  UPDATE candidacy AS c
  SET activite = 'INACTIF_CONFIRME'
  FROM caduque
  JOIN reason ON TRUE
  WHERE c.id = caduque.id
  RETURNING c.id
)
INSERT INTO candidacy_drop_out (
  candidacy_id,
  drop_out_reason_id,
  status,
  proof_received_by_admin,
  validated_at
)
SELECT updated.id, reason.id, caduque.status, TRUE, NOW()
FROM updated
JOIN caduque ON caduque.id = updated.id
CROSS JOIN reason
ON CONFLICT (candidacy_id) DO NOTHING;

COMMIT;
