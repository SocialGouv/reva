CREATE TABLE cohortes (
  id UUID DEFAULT uuid_generate_v4(),
  label varchar(255) NOT NULL,
  region varchar(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id)
);

CREATE TABLE diplomes (
  id UUID DEFAULT uuid_generate_v4(),
  label varchar(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id)
);

CREATE TABLE cohortes_diplomes (
  id UUID DEFAULT uuid_generate_v4(),
  cohorte_id UUID,
  diplome_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_cohorte
      FOREIGN KEY(cohorte_id) 
	      REFERENCES cohortes(id),
  CONSTRAINT fk_diplome
      FOREIGN KEY(diplome_id) 
	      REFERENCES diplomes(id)
);

 
CREATE TRIGGER set_cohortes_timestamp
BEFORE UPDATE ON cohortes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_diplomes_timestamp
BEFORE UPDATE ON diplomes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_cohortes_diplomes_timestamp
BEFORE UPDATE ON cohortes_diplomes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

INSERT INTO cohortes (id, label, region)
VALUES 
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', 'Paris 12', 'Île-de-France' ),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', 'Cergy', 'Île-de-France' ),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', 'Lyon', 'Auvergne-Rhône-Alpes' ),
('9566e646-6c2b-4c75-9206-2317a818c364', 'Montluçon', 'Auvergne-Rhône-Alpes'),
('52dd96d7-8b69-4ddb-aa5f-2387766d0760', 'Lille', 'Hauts-de-France'),
('7c032d28-fa28-4de2-98d6-34251a5097d9', 'Oise', 'Hauts-de-France'),
('1703872a-7e89-422d-b7c5-4434906bae5f', 'Mulhouse', 'Grand Est'),
('415f96fe-fef9-4f4b-bc02-20fcda3398eb', 'Montpellier', 'Occitanie'),
('2b877072-4637-4cb3-8b67-6a9b15a7250c', 'Toulouse', 'Occitanie'),
('98a3c0aa-86db-45ff-9ca1-761c5a04dce7', 'Nice', 'Provence-Alpes-Côte d''Azur'),
('dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2', 'Toulon', 'Provence-Alpes-Côte d''Azur');


INSERT INTO diplomes (id, label)
VALUES 
('9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2', 'TP Assistant⋅e de Vie aux Familles (TP ADVF)'),
('1d0863c5-aa0c-4d46-aa71-6f3d467ff45e', 'TP Agent⋅e de Service Médico-Social (TP ASMS)'),
('fa4e7e6e-8965-44ba-97f0-81440764f91a', 'Diplôme d''État Accompagnant⋅e Éducatif et Social (AES)'),
('65d1cc68-c601-4aa2-bae9-c422bea065bf', 'Titre Conducteur Accompagnateur de Personne à Mobilité Réduite (CaPMR)'),
('5ee1f090-c6f1-42dc-a712-54814cbdaf22', 'Titre Accompagnant⋅e en gérontologie'),
('e7f900e0-c9b0-4143-b5a6-8bb4ba66179c', 'Titre Employé⋅e Familial⋅e'),
('2cfb796f-9392-4f60-9a26-b41fc6b0ffde', 'Titre Assistant⋅e de vie dépendance');


INSERT INTO cohortes_diplomes (cohorte_id, diplome_id)
VALUES
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', '9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', '1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', 'fa4e7e6e-8965-44ba-97f0-81440764f91a'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', '65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', '5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', 'e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('f4e2d93a-5cee-490e-adc3-e23aeb66ffcb', '2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),

('84b3218a-a5bd-4e4b-b359-8562de9b04b7', '9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', '1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', 'fa4e7e6e-8965-44ba-97f0-81440764f91a'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', '65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', '5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', 'e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('84b3218a-a5bd-4e4b-b359-8562de9b04b7', '2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),

('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', '9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', '1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', 'fa4e7e6e-8965-44ba-97f0-81440764f91a'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', '65d1cc68-c601-4aa2-bae9-c422bea065bf'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', '5ee1f090-c6f1-42dc-a712-54814cbdaf22'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', 'e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('bab74b41-5710-44e6-bfa6-e28d4ecf60b8', '2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),

('9566e646-6c2b-4c75-9206-2317a818c364', '9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2'),
('9566e646-6c2b-4c75-9206-2317a818c364', '1d0863c5-aa0c-4d46-aa71-6f3d467ff45e'),

('52dd96d7-8b69-4ddb-aa5f-2387766d0760', 'fa4e7e6e-8965-44ba-97f0-81440764f91a'),

('7c032d28-fa28-4de2-98d6-34251a5097d9', 'fa4e7e6e-8965-44ba-97f0-81440764f91a'),

('1703872a-7e89-422d-b7c5-4434906bae5f', '65d1cc68-c601-4aa2-bae9-c422bea065bf'),

('415f96fe-fef9-4f4b-bc02-20fcda3398eb', '5ee1f090-c6f1-42dc-a712-54814cbdaf22'),

('2b877072-4637-4cb3-8b67-6a9b15a7250c', '5ee1f090-c6f1-42dc-a712-54814cbdaf22'),

('98a3c0aa-86db-45ff-9ca1-761c5a04dce7', 'e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('98a3c0aa-86db-45ff-9ca1-761c5a04dce7', '2cfb796f-9392-4f60-9a26-b41fc6b0ffde'),

('dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2', 'e7f900e0-c9b0-4143-b5a6-8bb4ba66179c'),
('dde7f9f7-b9d1-4cba-8f37-2224b9ca6dd2', '2cfb796f-9392-4f60-9a26-b41fc6b0ffde');