-- Insertion Organism / Hauts de France / 6 certifications concernées
INSERT INTO organism_region_certification 
(organism_id, region_id, is_architect, is_companion, certification_id)
VALUES
	('b492fae4-286d-4a7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'3ee32529-6ce6-4b27-9294-73b4295a4af8'), -- caferius
	('b492fae4-286d-4a	7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'4c6a804c-a0c6-461b-a00a-6cc13e19a315'), -- DETISF
	('b492fae4-286d-4a7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'bb2e7187-476e-478d-ab77-c38a0cd6ae83'), -- DEAES
	('b492fae4-286d-4a7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'14d38f55-639d-4d5b-80e8-396a3cbfa2be'), -- CAP AEPE
	('b492fae4-286d-4a7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'994b9bc4-e9f5-42c3-8556-f2494d11ebb4'), -- a domicile
	('b492fae4-286d-4a7d-b09e-353e34a4bc67', '283a284f-b595-4f9e-a67d-b2b2267978fd',TRUE, FALSE,'654c9471-6e2e-4ff2-a5d8-2069e78ea0d6'); -- en structure
	

-- Desactive le role d'AAP pour l'organism pour les 7 certifications concernees, il reste Surveillant veilleur de nuit
update organism_region_certification
set is_architect = false, is_companion = false
where organism_id = '289828f7-156c-4d5e-ad05-8bbc5869efc9'
and organism_region_certification.certification_id in (
'3ee32529-6ce6-4b27-9294-73b4295a4af8', -- caferius
'4c6a804c-a0c6-461b-a00a-6cc13e19a315', -- DETISF
'bb2e7187-476e-478d-ab77-c38a0cd6ae83', -- DEAES
'14d38f55-639d-4d5b-80e8-396a3cbfa2be', -- CAP AEPE
'994b9bc4-e9f5-42c3-8556-f2494d11ebb4', -- a domicile
'654c9471-6e2e-4ff2-a5d8-2069e78ea0d6', -- en structure
'e5a76f62-f35b-4d46-b19d-344cf1a623b5' -- CAPmr
);


-- On rattache les candidatures en projet ou validation au nouvel organism
update candidacy
set organism_id = 'b492fae4-286d-4a7d-b09e-353e34a4bc67'
where candidacy.id in (
select ca.id
from candidacy ca
inner join candidacy_candidacy_status ccs on ccs.candidacy_id = ca.id
where ca.organism_id = '289828f7-156c-4d5e-ad05-8bbc5869efc9'
and ccs.is_active = true
and ccs.status in ('PROJET', 'VALIDATION')
);


-- Extract des candidatures concernees pour contact avec le nouvel AAP
select candidate.email, concat('https://reva.beta.gouv.fr/admin/candidacies/', candidacy.id::text)
from candidacy
inner join candidate on candidate.id = candidacy.candidate_id
where organism_id = 'b492fae4-286d-4a7d-b09e-353e34a4bc67';
