CREATE TYPE indicator AS ENUM ('obtainment', 'profile');

CREATE TABLE measures (
  id UUID DEFAULT uuid_generate_v4(),
  label varchar(255) NOT NULL,
  indicator indicator NOT NULL,
  factor INT NOT NULL,
  min INT NOT NULL,
  max INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id)
);

CREATE TRIGGER set_measures_timestamp
BEFORE UPDATE ON measures
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE measures_answers (
  id UUID DEFAULT uuid_generate_v4(),
  measure_id UUID NOT NULL,
  survey_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_id UUID NOT NULL,
  score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_measures
      FOREIGN KEY(measure_id) 
          REFERENCES measures(id)
);

CREATE TRIGGER set_measures_answers_timestamp
BEFORE UPDATE ON measures_answers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- INSERT MEASURES

INSERT INTO measures (label, indicator, min, max, factor)
VALUES
    ('experience', 'obtainment', 0, 13, 5),
    ('motivation_intrinseque', 'profile', 0, 25, 5),
    ('confiance', 'profile', 0, 18, 2),
    ('disponibilite', 'obtainment', 0, 5, 3),
    ('aisance_numerique', 'profile', 0, 5, 1);

-- INSERT ANSWERS SCORES BY DEFAULT AT NULL

INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'experience';

INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'motivation_intrinseque';


INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'confiance';

INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'disponibilite';

INSERT INTO measures_answers 
(measure_id, survey_id, question_id, answer_id, score)
SELECT measures.id, surveys.id, q.id, a.id, null
FROM surveys, 
    jsonb_to_recordset(surveys.questions) as q(id UUID, answers jsonb), 
    jsonb_to_recordset(q.answers) as a(id UUID),
    measures
WHERE measures.label = 'aisance_numerique';


