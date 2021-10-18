/* Replace with your SQL commands */
DROP TRIGGER IF EXISTS set_cohortes_timestamp ON cohortes;
DROP TRIGGER IF EXISTS set_diplomes_timestamp ON diplomes;
DROP TRIGGER IF EXISTS set_cohortes_diplomes_timestamp ON cohortes_diplomes;



DROP TABLE IF EXISTS cohortes_diplomes;
DROP TABLE IF EXISTS cohortes;
DROP TABLE IF EXISTS diplomes;