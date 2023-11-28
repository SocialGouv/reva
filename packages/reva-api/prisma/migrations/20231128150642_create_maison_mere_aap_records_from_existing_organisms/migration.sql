DO $$

DECLARE v_maison_mere_aap_id uuid;
DECLARE v_organism_id uuid;


BEGIN FOR  v_maison_mere_aap_id, v_organism_id IN 
SELECT gen_random_uuid(),organism.id from organism where  organism.typology != 'experimentation' LOOP

INSERT INTO maison_mere_aap ("id","raison_sociale", "statut_juridique", "siret", "adresse", "code_postal", "ville", "typologie", "site_web", "date_expiration_certification_qualiopi", "gestionnaire_account_id") 
SELECT v_maison_mere_aap_id,organism.label, organism.legal_status, organism.siret, organism.address, organism.zip, organism.city, organism.typology, organism.website, COALESCE(organism.qualiopi_certificate_expires_at,DATE('1970-01-01')),account.id 
FROM organism,account 
WHERE organism.id=v_organism_id and account.id = (select account.id from account WHERE account.organism_id=organism.id limit 1); 

UPDATE organism set maison_mere_aap_id = v_maison_mere_aap_id where organism.id=v_organism_id;

END LOOP;


INSERT INTO maison_mere_aap_on_ccn ("ccn_id","maison_mere_aap_id") 
SELECT organism_on_ccn.ccn_id, maison_mere_aap.id from organism_on_ccn join organism on organism.id = organism_on_ccn.organism_id join maison_mere_aap on maison_mere_aap.id = organism.maison_mere_aap_id;


INSERT INTO maison_mere_aap_on_domaine ("domaine_id","maison_mere_aap_id") 
SELECT organism_on_domaine.domaine_id, maison_mere_aap.id from organism_on_domaine join organism on organism.id = organism_on_domaine.organism_id join maison_mere_aap on maison_mere_aap.id = organism.maison_mere_aap_id;


INSERT INTO maison_mere_aap_on_departement ("departement_id","est_sur_place","est_a_distance","maison_mere_aap_id") 
SELECT organism_department.department_id, is_onsite, is_remote, maison_mere_aap.id from organism_department join organism on organism.id = organism_department.organism_id join maison_mere_aap on maison_mere_aap.id = organism.maison_mere_aap_id;

END $$;

