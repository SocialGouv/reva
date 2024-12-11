ALTER TYPE "CertificationAuthorityContestationDecision" ADD VALUE 'DECISION_PENDING';
COMMIT;

BEGIN;
ALTER TABLE "candidacy_contestation_caducite" ALTER COLUMN "certification_authority_contestation_decision" SET NOT NULL,
ALTER COLUMN "certification_authority_contestation_decision" SET DEFAULT 'DECISION_PENDING';
COMMIT;
