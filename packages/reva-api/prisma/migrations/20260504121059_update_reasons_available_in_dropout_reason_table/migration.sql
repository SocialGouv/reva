-- Disable
UPDATE drop_out_reason SET is_active = false WHERE label = 'Report du projet à plus tard';

-- Update
UPDATE drop_out_reason SET label = 'Raisons personnelles (santé, famille)' WHERE label = 'Raisons personnelles(santé, famille)';
UPDATE drop_out_reason SET label = 'Problème pour financer le parcours (accompagnement, formation)' WHERE label = 'Financement non obtenu';
UPDATE drop_out_reason SET label = 'Problème pour financer les frais du certificateur (jury)' WHERE label = 'Financement du jury';

-- Add
INSERT INTO drop_out_reason (label, is_active) VALUES ('Délais trop longs (recevabilité, jury)', true);
INSERT INTO drop_out_reason (label, is_active) VALUES ('Réorientation hors France VAE', true);
INSERT INTO drop_out_reason (label, is_active) VALUES ('Non obtention d’un pré-requis', true);
INSERT INTO drop_out_reason (label, is_active) VALUES ('Candidature créée par erreur', true);
