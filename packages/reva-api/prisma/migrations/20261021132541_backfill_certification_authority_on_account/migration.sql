-- Backfill certification_authority_on_account from the legacy account.certification_authority_id FK.
-- The legacy column is kept as a safety net and is no longer written to by application code.
INSERT INTO "certification_authority_on_account" ("certification_authority_id", "account_id")
SELECT "certification_authority_id", "id" FROM "account"
WHERE "certification_authority_id" IS NOT NULL
ON CONFLICT ("certification_authority_id", "account_id") DO NOTHING;
