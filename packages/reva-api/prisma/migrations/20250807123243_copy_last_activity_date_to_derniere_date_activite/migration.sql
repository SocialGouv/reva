UPDATE candidacy
SET derniere_date_activite = last_activity_date
WHERE derniere_date_activite IS NULL AND last_activity_date IS NOT NULL;
