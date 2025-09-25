Insert into
    appointment (type, title, date, location, candidacy_id)
select
    'RENDEZ_VOUS_PEDAGOGIQUE',
    'Rendez-vous pédagogique',
    first_appointment_occured_at,
    null,
    id
from
    candidacy
where
    first_appointment_occured_at is not null;