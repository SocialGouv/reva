INSERT INTO measures (label, indicator, min, max, factor)
VALUES
    ('confiance_extrinseque', 'profile', 0, 5, 2);

INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'confiance_extrinseque';


UPDATE measures 
SET max = 13
WHERE label = 'confiance';