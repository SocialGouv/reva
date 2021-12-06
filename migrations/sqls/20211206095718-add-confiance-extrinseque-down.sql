DELETE FROM measures_answers WHERE measure_id = (SELECT id FROM measures WHERE label = 'confiance_extrinseque');

DELETE FROM measures WHERE label = 'confiance_extrinseque';


UPDATE measures 
SET max = 18, label = 'confiance'
WHERE label = 'confiance_intrinseque';