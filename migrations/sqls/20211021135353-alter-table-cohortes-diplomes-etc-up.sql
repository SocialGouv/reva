/* Replace with your SQL commands */

ALTER TABLE cohortes
RENAME TO cities;

ALTER TABLE cities RENAME CONSTRAINT cohortes_pkey TO cities_pkey;

ALTER TRIGGER set_cohortes_timestamp ON cities RENAME TO set_cities_timestamp;


CREATE TABLE cohortes (
  id UUID DEFAULT uuid_generate_v4(),
  label varchar(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id)
);

CREATE TRIGGER set_cohortes_timestamp
BEFORE UPDATE ON cohortes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TABLE cohortes_diplomes;

CREATE TABLE cohortes_diplomes_cities (
  id UUID DEFAULT uuid_generate_v4(),
  cohorte_id UUID,
  diplome_id UUID,
  city_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_cohorte
      FOREIGN KEY(cohorte_id) 
	      REFERENCES cohortes(id),
  CONSTRAINT fk_diplome
      FOREIGN KEY(diplome_id) 
	      REFERENCES diplomes(id),
  CONSTRAINT fk_city
      FOREIGN KEY(city_id) 
	      REFERENCES cities(id)
); 

CREATE TRIGGER set_cohortes_diplomes_cities_timestamp
BEFORE UPDATE ON cohortes_diplomes_cities
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE users_cohortes (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID,
  cohorte_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_users
      FOREIGN KEY(user_id) 
	      REFERENCES users(id),
  CONSTRAINT fk_cohorte
      FOREIGN KEY(cohorte_id) 
	      REFERENCES cohortes(id)
);

CREATE UNIQUE INDEX users_cohortes_uniqueuser_cohorte ON users_cohortes (user_id, cohorte_id);

CREATE TRIGGER set_users_cohortes_timestamp
BEFORE UPDATE ON users_cohortes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


ALTER TABLE ONLY users_roles ALTER COLUMN id SET DEFAULT uuid_generate_v4();


-- DATAS

-- "1703872a-7e89-422d-b7c5-4434906bae5f"	"Mulhouse"	"Grand Est"
-- "2b877072-4637-4cb3-8b67-6a9b15a7250c"	"Toulouse"	"Occitanie"
-- "415f96fe-fef9-4f4b-bc02-20fcda3398eb"	"Montpellier"	"Occitanie"
-- "52dd96d7-8b69-4ddb-aa5f-2387766d0760"	"Lille"	"Hauts-de-France"
-- "7c032d28-fa28-4de2-98d6-34251a5097d9"	"Oise"	"Hauts-de-France"
-- "84b3218a-a5bd-4e4b-b359-8562de9b04b7"	"Cergy"	"Île-de-France"
-- "9566e646-6c2b-4c75-9206-2317a818c364"	"Montluçon"	"Auvergne-Rhône-Alpes"
-- "98a3c0aa-86db-45ff-9ca1-761c5a04dce7"	"Nice"	"Provence-Alpes-Côte d'Azur"
-- "bab74b41-5710-44e6-bfa6-e28d4ecf60b8"	"Lyon"	"Auvergne-Rhône-Alpes"
-- "dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2"	"Toulon"	"Provence-Alpes-Côte d'Azur"
-- "f4e2d93a-5cee-490e-adc3-e23aeb66ffcb"	"Paris 12"	"Île-de-France"

-- "1d0863c5-aa0c-4d46-aa71-6f3d467ff45e"	"TP Agent⋅e de Service Médico-Social (TP ASMS)"
-- "2cfb796f-9392-4f60-9a26-b41fc6b0ffde"	"Titre Assistant⋅e de vie dépendance"
-- "5ee1f090-c6f1-42dc-a712-54814cbdaf22"	"Titre Accompagnant⋅e en gérontologie"
-- "65d1cc68-c601-4aa2-bae9-c422bea065bf"	"Titre Conducteur Accompagnateur de Personne à Mobilité Réduite (CaPMR)"
-- "9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2"	"TP Assistant⋅e de Vie aux Familles (TP ADVF)"
-- "e7f900e0-c9b0-4143-b5a6-8bb4ba66179c"	"Titre Employé⋅e Familial⋅e"
-- "fa4e7e6e-8965-44ba-97f0-81440764f91a"	"Diplôme d'État Accompagnant⋅e Éducatif et Social (AES)"

INSERT INTO cohortes (id, label)
VALUES 
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5', 'IDFCOLL'),
('f2fb1813-75af-4181-ae3b-e3832a744d90', 'IPERIAIDFCOLL'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22', 'AURACOLL'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf', 'IPERIAAURACOLL'),
('d52e27d2-50a1-4d4e-aff1-df94c9b73095', 'ADVF03'),
('87397bc6-d0f0-4f4b-a4f2-8e05211a083a', 'ASMS03'),
('93fc9e37-9377-4bde-a064-50cf8873092b', 'DEAES59'),
('8901e188-138e-44a5-8b49-225e31fb1a8b', 'DEAES60'),
('66167d29-8a80-4c22-b805-9e994da5757a', 'CAPMFR68'),
('dabdf755-f7bc-41ec-9775-2f55f43ea9c7', 'GER31'),
('0b706f40-50e6-42b2-8a3f-b880badf7978', 'GER34'),
('cd3fe803-1c1e-42e1-b2fe-da5e81095670', 'EF06'),
('5a558f32-7365-479b-a295-b8f6ea014a33', 'AVD06'),
('8ece3dde-e8e0-44e1-a96b-e64356df3377', 'EF83'),
('9edbda14-fa37-4616-b579-b744b6100f67', 'AVD83');

INSERT INTO cohortes_diplomes_cities (cohorte_id, city_id, diplome_id)
VALUES

-- IDF 

-- .. PARIS

-- .... IDFCOLL

('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- ..... IPERIAIDFCOLL

('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','f4e2d93a-5cee-490e-adc3-e23aeb66ffcb','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- .. CERGY

-- .... IDFCOLL

('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('a1df0cab-b84a-43b5-b194-a5ce82bb81d5','84b3218a-a5bd-4e4b-b359-8562de9b04b7','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- ..... IPERIAIDFCOLL

('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('f2fb1813-75af-4181-ae3b-e3832a744d90','84b3218a-a5bd-4e4b-b359-8562de9b04b7','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- AURA 

-- .. LYON

-- .... AURACOLL

('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('64ca8ed9-e876-4d54-90fa-4d16b01f2d22','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- .... IPERIAAURACOLL

('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('f4f7681f-3671-40a9-9e70-ba7fb3b0cdbf','bab74b41-5710-44e6-bfa6-e28d4ecf60b8','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- .. MONTLUCON

-- .... ADVF03

('d52e27d2-50a1-4d4e-aff1-df94c9b73095','9566e646-6c2b-4c75-9206-2317a818c364','9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('87397bc6-d0f0-4f4b-a4f2-8e05211a083a','9566e646-6c2b-4c75-9206-2317a818c364','1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),

-- HDF

-- .. LILLE

-- .... DEAES59

('93fc9e37-9377-4bde-a064-50cf8873092b','52dd96d7-8b69-4ddb-aa5f-2387766d0760','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- .. OISE

-- .... DEAES60

('8901e188-138e-44a5-8b49-225e31fb1a8b','7c032d28-fa28-4de2-98d6-34251a5097d9','fa4e7e6e-8965-44ba-97f0-81440764f91a'),

-- GRAND EST 

-- .. MULHOUSE

-- .... CAPMFR68

('66167d29-8a80-4c22-b805-9e994da5757a','1703872a-7e89-422d-b7c5-4434906bae5f','65d1cc68-c601-4aa2-bae9-c422bea065bf'),

-- OCCITANIE

-- .. MONTPELLIER

-- .... GER34

('0b706f40-50e6-42b2-8a3f-b880badf7978','415f96fe-fef9-4f4b-bc02-20fcda3398eb','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),

-- .. TOULOUSE

-- .... GER31

('dabdf755-f7bc-41ec-9775-2f55f43ea9c7','2b877072-4637-4cb3-8b67-6a9b15a7250c','5ee1f090-c6f1-42dc-a712-54814cbdaf22'),

-- PACA

-- .. NICE

-- .... EF06

('cd3fe803-1c1e-42e1-b2fe-da5e81095670','98a3c0aa-86db-45ff-9ca1-761c5a04dce7','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),

-- .... AVD06

('5a558f32-7365-479b-a295-b8f6ea014a33','98a3c0aa-86db-45ff-9ca1-761c5a04dce7','2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),

-- .. TOULON

-- .... EF83

('8ece3dde-e8e0-44e1-a96b-e64356df3377','dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2','e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),

-- .... AVD83

('9edbda14-fa37-4616-b579-b744b6100f67','dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2','2cfb796f-9392-4f60-9a26-b41fc6b0ffde');