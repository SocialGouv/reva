-- Anonymization script for Keycloak personal data
-- Replaces PII (username, email, firstname, lastname) with deterministic but fake values.
-- The id-based suffix keeps rows distinguishable for debugging while removing real data.
--
-- Run against a non-production Keycloak database only.
BEGIN;

-- user_entity
UPDATE user_entity
SET
  username = 'user-' || id || '@anon.invalid',
  email = 'user-' || id || '@anon.invalid',
  email_constraint = 'user-' || id || '@anon.invalid',
  first_name = CASE
    WHEN first_name IS NOT NULL THEN 'Prénom-' || LEFT (id, 8)
  END,
  last_name = CASE
    WHEN last_name IS NOT NULL THEN 'Nom-' || LEFT (id, 8)
  END;

COMMIT;