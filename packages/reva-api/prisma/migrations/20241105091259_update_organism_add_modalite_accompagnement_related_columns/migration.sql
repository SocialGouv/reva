-- CreateEnum
CREATE TYPE "OrganismModaliteAccompagnement" AS ENUM ('A_DISTANCE', 'LIEU_ACCUEIL');

-- AlterTable
ALTER TABLE "organism"
ADD COLUMN "modalite_accompagnement" "OrganismModaliteAccompagnement",
ADD COLUMN "modalite_accompagnement_renseignee_et_valide" BOOLEAN;

UPDATE "organism"
SET
  "modalite_accompagnement" = 'A_DISTANCE'
WHERE
  "is_head_agency" = true;

UPDATE "organism"
SET
  "modalite_accompagnement" = 'LIEU_ACCUEIL'
WHERE
  "is_head_agency" = false;

ALTER TABLE "organism"
ALTER COLUMN "modalite_accompagnement"
SET
  NOT NULL;

UPDATE "organism"
SET
  "modalite_accompagnement_renseignee_et_valide" = false;

UPDATE "organism"
SET
  "modalite_accompagnement_renseignee_et_valide" = true
WHERE
  "is_head_agency" = true
  and "is_remote" = true;

UPDATE "organism"
SET
  "modalite_accompagnement_renseignee_et_valide" = true
WHERE
  "is_head_agency" = false
  and "is_onsite" = true;

ALTER TABLE "organism"
ALTER COLUMN "modalite_accompagnement_renseignee_et_valide"
SET
  NOT NULL;