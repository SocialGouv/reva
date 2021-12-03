CREATE TYPE candidacy_status AS ENUM (
  'submitted', 
  'estimated_favorable', 
  'estimated_uncertain', 
  'estimated_negative', 
  'reviewed', 
  'pending', 
  'accepted_at_full', 
  'accepted_at_partial'
  'rejected_by_adviser', 
  'rejected_by_jury');

CREATE TABLE candidacies_statuses (  
  id UUID DEFAULT uuid_generate_v4(),
  candidacy_id UUID,
  status candidacy_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_candidacy
      FOREIGN KEY(candidacy_id) 
        REFERENCES candidacies(id)
);

CREATE TRIGGER set_candidacies_statuses_timestamp
BEFORE UPDATE ON candidacies_statuses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



-- ADD A STATUS submitted FOR EACH CANDIDACIES

INSERT INTO candidacies_statuses (candidacy_id, status, created_at)
SELECT c.id, 'submitted', c.created_at
FROM candidacies c;