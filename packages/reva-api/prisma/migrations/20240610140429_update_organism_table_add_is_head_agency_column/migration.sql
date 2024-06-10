-- AlterTable
ALTER TABLE "organism"
ADD COLUMN "is_head_agency" BOOLEAN NOT NULL DEFAULT false;

UPDATE organism o
SET
    is_head_agency = 'true'
WHERE
    o.id IN (
        SELECT
            account.organism_id
        FROM
            account
            JOIN maison_mere_aap ON maison_mere_aap.gestionnaire_account_id = account.id
    );