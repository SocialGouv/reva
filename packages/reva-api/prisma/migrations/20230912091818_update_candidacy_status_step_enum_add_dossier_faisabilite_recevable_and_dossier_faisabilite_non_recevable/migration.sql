-- AlterEnum
ALTER TYPE "CandidacyStatusStep"
ADD VALUE 'DOSSIER_FAISABILITE_RECEVABLE';
ALTER TYPE "CandidacyStatusStep"
ADD VALUE 'DOSSIER_FAISABILITE_NON_RECEVABLE';
COMMIT;
-- Migrate candidacy in DOSSIER_FAISABILITE_ENVOYE status with a feasibility result
DO $$
DECLARE cid uuid;
DECLARE decision varchar;
DECLARE is_active boolean;
BEGIN FOR cid,
decision,
is_active IN -- 
--
-- select all candidacies in the "DOSSIER_FAISABILITE_ENVOYE" status with a feasibility decision not pending
SELECT candidacy.id,
    feasibility.decision,
    candidacy_candidacy_status.is_active
FROM candidacy
    join candidacy_candidacy_status on candidacy.id = candidacy_candidacy_status.candidacy_id
    join feasibility on candidacy.id = feasibility.candidacy_id
WHERE candidacy_candidacy_status.status = 'DOSSIER_FAISABILITE_ENVOYE'
    and feasibility.decision != 'PENDING' LOOP -- insert missing status
    -- insert the new status based on the feasibility result
    -- if the   "DOSSIER_FAISABILITE_ENVOYE" status was active then the new one is also
INSERT INTO candidacy_candidacy_status (id, candidacy_id, status, is_active)
VALUES (
        gen_random_uuid(),
        cid,
        CASE
            WHEN decision = 'ADMISSIBLE' THEN 'DOSSIER_FAISABILITE_RECEVABLE'::"CandidacyStatusStep"
            WHEN decision = 'REJECTED' THEN 'DOSSIER_FAISABILITE_NON_RECEVABLE'::"CandidacyStatusStep"
        END,
        is_active
    );
-- if DOSSIER_FAISABILITE_ENVOYE was the active status, make it inactive since it has been replaced with either DOSSIER_FAISABILITE_RECEVABLE or DOSSIER_FAISABILITE_NON_RECEVABLE
UPDATE candidacy_candidacy_status
set is_active = false
where candidacy_id = cid
    and candidacy_candidacy_status.status = 'DOSSIER_FAISABILITE_ENVOYE';
END LOOP;
END $$;