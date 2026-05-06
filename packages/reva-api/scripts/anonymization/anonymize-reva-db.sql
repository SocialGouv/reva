-- Anonymization script for REVA personal data
-- Replaces PII (email, firstname, lastname, given name, middle name, phone) with deterministic but fake values.
-- The id-based suffix keeps rows distinguishable for debugging while removing real data.
--
-- Run against a non-production database only.
BEGIN;

-- candidate
UPDATE candidate
SET
  email = 'candidate-' || keycloak_id || '@anon.invalid',
  phone = '0101010101',
  firstname = 'Prénom-' || LEFT(keycloak_id::text, 8),
  firstname2 = CASE
    WHEN firstname2 IS NOT NULL THEN 'Prénom2-' || LEFT(keycloak_id::text, 8)
  END,
  firstname3 = CASE
    WHEN firstname3 IS NOT NULL THEN 'Prénom3-' || LEFT(keycloak_id::text, 8)
  END,
  lastname = 'Nom-' || LEFT(id::text, 8),
  given_name = CASE
    WHEN given_name IS NOT NULL THEN 'Nom-' || LEFT(keycloak_id::text, 8)
  END,
  middle_names = CASE
    WHEN middle_names IS NOT NULL THEN 'Prénoms-' || LEFT(keycloak_id::text, 8)
  END;

-- account
UPDATE account
SET
  email = 'account-' || keycloak_id || '@anon.invalid',
  firstname = CASE
    WHEN firstname IS NOT NULL THEN 'Prénom-' || LEFT(keycloak_id::text, 8)
  END,
  lastname = CASE
    WHEN lastname IS NOT NULL THEN 'Nom-' || LEFT(keycloak_id::text, 8)
  END;

-- funding_request_unifvae
UPDATE funding_request_unifvae
SET
  candidate_firstname = 'Prénom-' || LEFT(id::text, 8),
  candidate_secondname = CASE
    WHEN candidate_secondname IS NOT NULL THEN 'Prénom2-' || LEFT(id::text, 8)
  END,
  candidate_thirdname = CASE
    WHEN candidate_thirdname IS NOT NULL THEN 'Prénom3-' || LEFT(id::text, 8)
  END,
  candidate_lastname = 'Nom-' || LEFT(id::text, 8),
  funding_contact_firstname = CASE
    WHEN funding_contact_firstname IS NOT NULL THEN 'Prénom-' || LEFT(id::text, 8)
  END,
  funding_contact_lastname = CASE
    WHEN funding_contact_lastname IS NOT NULL THEN 'Nom-' || LEFT(id::text, 8)
  END,
  funding_contact_email = CASE
    WHEN funding_contact_email IS NOT NULL THEN 'contact-' || id || '@anon.invalid'
  END,
  funding_contact_phone = CASE
    WHEN funding_contact_phone IS NOT NULL THEN '0101010101'
  END;

-- maison_mere_aap
UPDATE maison_mere_aap
SET
  manager_firstname = CASE
    WHEN manager_firstname IS NOT NULL THEN 'Prénom-' || LEFT(id::text, 8)
  END,
  manager_lastname = CASE
    WHEN manager_lastname IS NOT NULL THEN 'Nom-' || LEFT(id::text, 8)
  END,
  phone = CASE
    WHEN phone IS NOT NULL THEN '0101010101'
  END;

-- maison_mere_aap_legal_information_documents
UPDATE maison_mere_aap_legal_information_documents
SET
  manager_firstname = 'Prénom-' || LEFT(id::text, 8),
  manager_lastname = 'Nom-' || LEFT(id::text, 8);

-- subscription_request (camelCase column names — no @map in Prisma schema)
UPDATE subscription_request
SET
  "managerFirstname" = 'Prénom-' || LEFT(id::text, 8),
  "managerLastname" = 'Nom-' || LEFT(id::text, 8),
  "accountFirstname" = 'Prénom-' || LEFT(id::text, 8),
  "accountLastname" = 'Nom-' || LEFT(id::text, 8),
  "accountEmail" = 'account-' || id || '@anon.invalid',
  "accountPhoneNumber" = '0101010101';

-- organism (administrative contact email + public contact email + phones)
UPDATE organism
SET
  contact_administrative_email = 'organism-' || id || '@anon.invalid',
  contact_administrative_phone = CASE
    WHEN contact_administrative_phone IS NOT NULL THEN '0101010101'
  END,
  telephone = CASE
    WHEN telephone IS NOT NULL THEN '0101010101'
  END,
  email_contact = CASE
    WHEN email_contact IS NOT NULL THEN 'contact-' || id || '@anon.invalid'
  END;

-- certification_authority (contact info may identify individuals)
UPDATE certification_authority
SET
  contact_full_name = CASE
    WHEN contact_full_name IS NOT NULL THEN 'Contact-' || LEFT(id::text, 8)
  END,
  contact_email = CASE
    WHEN contact_email IS NOT NULL THEN 'ca-' || id || '@anon.invalid'
  END,
  contact_phone = CASE
    WHEN contact_phone IS NOT NULL THEN '0101010101'
  END;

-- certification_authority_local_account
UPDATE certification_authority_local_account
SET
  contact_full_name = CASE
    WHEN contact_full_name IS NOT NULL THEN 'Contact-' || LEFT(id::text, 8)
  END,
  contact_email = CASE
    WHEN contact_email IS NOT NULL THEN 'cala-' || id || '@anon.invalid'
  END,
  contact_phone = CASE
    WHEN contact_phone IS NOT NULL THEN '0101010101'
  END;

-- certification_additional_info (expert contact phone)
UPDATE certification_additional_info
SET
  certification_expert_contact_phone = CASE
    WHEN certification_expert_contact_phone IS NOT NULL THEN '0101010101'
  END;

-- candidacy_log
UPDATE candidacy_log
SET
  user_email = 'user-' || id || '@anon.invalid';

-- aap_log
UPDATE aap_log
SET
  user_email = 'user-' || id || '@anon.invalid';

COMMIT;
