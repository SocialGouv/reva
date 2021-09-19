CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE surveys (  
  id UUID,
  questions jsonb,
  latest BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id)
);

CREATE TABLE candidate_answers (
  id UUID,
  survey_id UUID NOT NULL,
  answers jsonb,
  candidate jsonb, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_survey
      FOREIGN KEY(survey_id) 
	      REFERENCES surveys(id)
);

CREATE TRIGGER set_suvery_timestamp
BEFORE UPDATE ON surveys
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_candidate_answers_timestamp
BEFORE UPDATE ON candidate_answers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();