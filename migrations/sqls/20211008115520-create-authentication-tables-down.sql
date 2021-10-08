/* Replace with your SQL commands */

DROP TRIGGER IF EXISTS set_users_timestamp ON users ;
DROP TRIGGER IF EXISTS set_users_roles_timestamp ON users_roles;
DROP TABLE IF EXISTS users_roles;
DROP TABLE IF EXISTS users;