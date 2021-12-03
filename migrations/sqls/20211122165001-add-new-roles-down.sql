ALTER TABLE users_roles
ALTER COLUMN role_id TYPE varchar(255);

ALTER TABLE users_roles
ALTER COLUMN role_id SET DEFAULT NULL;

DROP TYPE user_role;
