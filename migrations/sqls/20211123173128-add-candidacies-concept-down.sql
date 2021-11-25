ALTER TABLE users DROP COLUMN phone;
ALTER TABLE candidate_answers DROP COLUMN candidacy_id;
DROP TABLE candidacies;
DROP TABLE tmp_conflicted_candidate_answers;

DELETE FROM users_roles WHERE role_id='candidate';

DELETE FROM users WHERE NOT EXISTS (SELECT FROM users_roles ur WHERE ur.user_id = users.id);