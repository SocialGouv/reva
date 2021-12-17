CREATE TYPE log_actions AS ENUM (
  'create', 
  'update', 
  'delete');

CREATE TYPE skill_types AS ENUM (
  'official', 
  'custom');


CREATE TABLE skills (  
  id UUID DEFAULT uuid_generate_v4(),
  label text NOT NULL,
  comment text NOT NULL,
  type skill_types NOT NULL,
  category varchar(255) NOT NULL,
  candidacy_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_candidacy
      FOREIGN KEY(candidacy_id) 
        REFERENCES candidacies(id)
);

CREATE TRIGGER set_skills_timestamp
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE skills_logs (
  id UUID DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL,
  emitter_id UUID NOT NULL,
  action log_actions NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_skill
      FOREIGN KEY(skill_id) 
        REFERENCES skills(id),
  CONSTRAINT fk_emitter
      FOREIGN KEY(emitter_id) 
        REFERENCES users(id)
);

CREATE TRIGGER set_skills_logs_timestamp
BEFORE UPDATE ON skills_logs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
