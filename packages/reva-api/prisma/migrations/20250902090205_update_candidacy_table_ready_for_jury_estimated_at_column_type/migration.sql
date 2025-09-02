-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "ready_for_jury_estimated_at_v2" DATE;

update candidacy
set
    ready_for_jury_estimated_at_v2 = case
        when date_part ('hour', ready_for_jury_estimated_at) <= 12 THEN DATE (ready_for_jury_estimated_at)
        when date_part ('hour', ready_for_jury_estimated_at) > 12 THEN DATE (ready_for_jury_estimated_at) + INTERVAL '1 DAY'
    END;

ALTER TABLE "candidacy"
DROP COLUMN "ready_for_jury_estimated_at";

ALTER TABLE "candidacy"
RENAME COLUMN "ready_for_jury_estimated_at_v2" TO "ready_for_jury_estimated_at";