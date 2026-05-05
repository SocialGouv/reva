UPDATE drop_out_reason SET label = 'Reprise d''emploi' WHERE label = 'Reprise d’emploi';
UPDATE drop_out_reason SET label = 'Avis défavorable de l''Architecte Accompagnateur de Parcours' WHERE label = 'Avis architecte de parcours défavorable';
UPDATE drop_out_reason SET label = 'Non obtention d''un pré-requis' WHERE label = 'Non obtention d’un pré-requis';

UPDATE drop_out_reason SET is_active = false;

UPDATE drop_out_reason SET is_active = true WHERE label = 'Reprise d''emploi';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Entrée en formation';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Découragement';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Raisons personnelles (santé, famille)';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Changement de projet';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Manque de temps';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Pas / plus intéressé';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Rémunération non obtenue';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Avis défavorable de l''Architecte Accompagnateur de Parcours';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Problème pour financer le parcours (accompagnement, formation)';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Problème pour financer les frais du certificateur (jury)';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Délais trop longs (recevabilité, jury)';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Réorientation hors France VAE';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Non obtention d''un pré-requis';
UPDATE drop_out_reason SET is_active = true WHERE label = 'Candidature créée par erreur';
