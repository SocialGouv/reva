CREATE TYPE user_role AS ENUM ('admin', 'certifier', 'companion', 'candidate');


ALTER TABLE users_roles
RENAME COLUMN role_id TO old_role_id;

ALTER TABLE users_roles
ADD COLUMN role_id user_role NOT NULL DEFAULT 'candidate';

UPDATE users_roles SET role_id='admin' WHERE old_role_id='admin';

ALTER TABLE users_roles
DROP COLUMN old_role_id;