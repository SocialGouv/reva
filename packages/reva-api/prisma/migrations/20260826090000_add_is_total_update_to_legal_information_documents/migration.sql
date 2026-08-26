-- Origine de la demande, figee a la soumission: un refus ne renvoie l'AAP vers une mise
-- a jour totale que si la demande refusee en etait une, d'ou le defaut a true.
ALTER TABLE "maison_mere_aap_legal_information_documents" ADD COLUMN     "is_total_update" BOOLEAN NOT NULL DEFAULT true;
