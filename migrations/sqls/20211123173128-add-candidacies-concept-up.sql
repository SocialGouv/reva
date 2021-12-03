ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE users ADD COLUMN phone varchar(255) DEFAULT NULL;

CREATE TABLE candidacies (  
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID,
  cohorte_id UUID,
  diplome_id UUID,
  city_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
        REFERENCES users(id),
  CONSTRAINT fk_cohorte
      FOREIGN KEY(cohorte_id) 
        REFERENCES cohortes(id),
  CONSTRAINT fk_city
      FOREIGN KEY(city_id) 
        REFERENCES cities(id),
  CONSTRAINT fk_diplome
      FOREIGN KEY(diplome_id) 
        REFERENCES diplomes(id)
);

CREATE TRIGGER set_candidacies_timestamp
BEFORE UPDATE ON candidacies
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Define role as certifier for existing users not admin

INSERT INTO users_roles (user_id, role_id)
SELECT users.id, 'certifier'
FROM users
WHERE NOT EXISTS (SELECT FROM users_roles ur WHERE ur.user_id = users.id AND role_id = 'admin');


-- ISOLATE CONFLICTED CANDIDATE_ANSWERS

select distinct ca.id as id, co.label as "cohorte", di.label as "diplome", ca.candidate->>'email' as email, ca.candidate->>'firstname' as firstname, ca.candidate->>'lastname' as lastname, concat('''',ca.candidate->>'phoneNumber')
into tmp_conflicted_candidate_answers
from candidate_answers ca, 
  candidate_answers ca2,
  cohortes co,
  cohortes_diplomes_cities cdc,
  diplomes di
where trim(ca.candidate->>'email') = trim(ca2.candidate->>'email')
and co.id = cdc.cohorte_id
and (cdc.city_id::text = ca.candidate->>'cohorte' or ca.candidate->>'cohorte' is null)
and cdc.diplome_id::text = ca.candidate->>'diplome'
and cdc.diplome_id = di.id
and ca.id != ca2.id
and (trim(ca.candidate->>'firstname') != trim(ca2.candidate->>'firstname')
or trim(ca.candidate->>'lastname') != trim(ca2.candidate->>'lastname')
or trim(ca.candidate->>'phoneNumber') != trim(ca2.candidate->>'phoneNumber'))
order by email, firstname, lastname;


INSERT INTO users (email, firstname, lastname, phone, password)
SELECT distinct trim(ca.candidate->>'email') as email, trim(ca.candidate->>'firstname') as firstname, trim(ca.candidate->>'lastname') as lastname, trim(ca.candidate->>'phoneNumber') as phone, uuid_generate_v4()
FROM candidate_answers ca
WHERE NOT EXISTS (SELECT FROM tmp_conflicted_candidate_answers tmp_ca WHERE tmp_ca.id = ca.id )
AND NOT EXISTS (SELECT FROM users u WHERE u.email = trim(ca.candidate->>'email') )
GROUP BY email, firstname,lastname,phone;

INSERT INTO users_roles (user_id, role_id)
SELECT users.id, 'candidate'
FROM users
WHERE NOT EXISTS (SELECT FROM users_roles ur WHERE ur.user_id = users.id );

INSERT INTO candidacies (user_id, cohorte_id, diplome_id, city_id, created_at)
SELECT users.id, cdc.cohorte_id, cdc.diplome_id, cdc.city_id, MIN(ca.created_at)
FROM candidate_answers ca, users, cohortes_diplomes_cities cdc
WHERE trim(ca.candidate->>'email') = users.email
AND ca.candidate->>'cohorte' IS NOT NULL
AND cdc.city_id::text = ca.candidate->>'cohorte'
AND cdc.diplome_id::text = ca.candidate->>'diplome'
GROUP BY users.id, cdc.cohorte_id, cdc.diplome_id, cdc.city_id;

ALTER TABLE candidate_answers ADD COLUMN candidacy_id UUID DEFAULT null;
ALTER TABLE candidate_answers
    ADD CONSTRAINT fk_candidacy FOREIGN KEY (candidacy_id) REFERENCES candidacies (id);

UPDATE candidate_answers
SET candidacy_id = can.id
FROM candidacies can, users, cohortes_diplomes_cities cdc 
WHERE can.user_id = users.id
AND users.email = trim(candidate_answers.candidate->>'email')
AND can.cohorte_id = cdc.cohorte_id
AND can.diplome_id = cdc.diplome_id
AND can.city_id = cdc.city_id
AND can.city_id::text = trim(candidate_answers.candidate->>'cohorte')
AND can.diplome_id::text = trim(candidate_answers.candidate->>'diplome');
