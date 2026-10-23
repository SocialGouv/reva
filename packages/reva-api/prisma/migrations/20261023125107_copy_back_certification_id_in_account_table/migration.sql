-- Copy back certificationAuthorityId into the account table.
-- The column was recreated (drop + add) in a prior migration, which lost its data.
-- Restore it from certification_authority_on_account, which is now the source of truth
-- and has a unique constraint on account_id (1:1 with account).
UPDATE "account" a
SET "certificationAuthorityId" = coa."certification_authority_id"
FROM "certification_authority_on_account" coa
WHERE coa."account_id" = a."id";
