ALTER TABLE "candidacy"
DROP COLUMN "activite",
DROP COLUMN "derniere_date_activite",
DROP COLUMN "date_inactif_en_attente",
DROP COLUMN "last_activity_date";

DROP TYPE "ActiviteStatut";

DROP TABLE "candidacy_contestation_caducite";
DROP TYPE "CertificationAuthorityContestationDecision";

DELETE FROM "candidacy_email"
WHERE "email_type" IN (
  'INACTIF_EN_ATTENTE_BEFORE_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE',
  'INACTIF_EN_ATTENTE_AFTER_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE'
);

CREATE TYPE "CandidacyEmailType_new" AS ENUM (
  'CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP',
  'CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE',
  'CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP',
  'REMINDER_TO_AAP_FOR_MISSING_SWORN_STATEMENT'
);

ALTER TABLE "candidacy_email"
ALTER COLUMN "email_type" TYPE "CandidacyEmailType_new"
USING "email_type"::TEXT::"CandidacyEmailType_new";

ALTER TYPE "CandidacyEmailType" RENAME TO "CandidacyEmailType_old";
ALTER TYPE "CandidacyEmailType_new" RENAME TO "CandidacyEmailType";
DROP TYPE "CandidacyEmailType_old";
