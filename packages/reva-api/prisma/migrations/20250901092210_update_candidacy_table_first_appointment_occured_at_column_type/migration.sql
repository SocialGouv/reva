-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "first_appointment_occured_at_v2" DATE;

update candidacy
set
    first_appointment_occured_at_v2 = case
        when date_part ('hour', first_appointment_occured_at) <= 12 THEN DATE (first_appointment_occured_at)
        when date_part ('hour', first_appointment_occured_at) > 12 THEN DATE (first_appointment_occured_at) + INTERVAL '1 DAY'
    END;

ALTER TABLE "candidacy"
DROP COLUMN "first_appointment_occured_at";

ALTER TABLE "candidacy"
RENAME COLUMN "first_appointment_occured_at_v2" TO "first_appointment_occured_at";