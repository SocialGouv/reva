-- Migration: Merge "Abondements via Mon Compte Personnel Formation" amounts into "Droits CPF via Mon Compte Personnel Formation"

-- Step 1: Update existing "Droits CPF" records by adding the "Abondements" amount
UPDATE candidacy_on_candidacy_financing_method
SET
    amount = amount + (
        SELECT cocfm.amount
        FROM candidacy_on_candidacy_financing_method cocfm
        JOIN candidacy_financing_method cfm ON cocfm.candidacy_financing_method = cfm.id
        WHERE cfm.label = 'Abondements via Mon Compte Personnel Formation'
        AND cocfm.candidacy_id = candidacy_on_candidacy_financing_method.candidacy_id
    )
WHERE candidacy_financing_method IN (
    SELECT id FROM candidacy_financing_method WHERE label = 'Droits CPF via Mon Compte Personnel Formation'
)
AND candidacy_id IN (
    SELECT DISTINCT cocfm.candidacy_id
    FROM candidacy_on_candidacy_financing_method cocfm
    JOIN candidacy_financing_method cfm ON cocfm.candidacy_financing_method = cfm.id
    WHERE cfm.label = 'Abondements via Mon Compte Personnel Formation'
);

-- Step 2: Insert new "Droits CPF" records for candidacies that don't have them yet
INSERT INTO candidacy_on_candidacy_financing_method (
    candidacy_id,
    candidacy_financing_method,
    amount
)
SELECT
    cocfm.candidacy_id,
    cfm_droits.id as candidacy_financing_method,
    cocfm.amount
FROM candidacy_on_candidacy_financing_method cocfm
JOIN candidacy_financing_method cfm ON cocfm.candidacy_financing_method = cfm.id
CROSS JOIN candidacy_financing_method cfm_droits
WHERE cfm.label = 'Abondements via Mon Compte Personnel Formation'
AND cfm_droits.label = 'Droits CPF via Mon Compte Personnel Formation'
AND NOT EXISTS (
    SELECT 1
    FROM candidacy_on_candidacy_financing_method existing
    WHERE existing.candidacy_id = cocfm.candidacy_id
    AND existing.candidacy_financing_method = cfm_droits.id
);

-- Step 3: Remove all "Abondements" records from candidacy_on_candidacy_financing_method
DELETE FROM candidacy_on_candidacy_financing_method
WHERE candidacy_financing_method IN (
    SELECT id FROM candidacy_financing_method WHERE label = 'Abondements via Mon Compte Personnel Formation'
);

-- Step 4: Rename "Droits CPF" to include abondements
UPDATE candidacy_financing_method
SET label = 'Droits CPF et abondements via Mon Compte Personnel Formation'
WHERE label = 'Droits CPF via Mon Compte Personnel Formation';

-- Step 5: Store the order of the abondements row before deletion
DO $$
DECLARE
    abondements_order INT;
BEGIN
    SELECT "order" INTO abondements_order
    FROM candidacy_financing_method
    WHERE label = 'Abondements via Mon Compte Personnel Formation';

    -- Step 6: Delete the "Abondements" financing method
    DELETE FROM candidacy_financing_method
    WHERE label = 'Abondements via Mon Compte Personnel Formation';

    -- Step 7: Fill the gap in order column by decrementing all higher orders
    UPDATE candidacy_financing_method
    SET "order" = "order" - 1
    WHERE "order" > abondements_order;
END $$;
