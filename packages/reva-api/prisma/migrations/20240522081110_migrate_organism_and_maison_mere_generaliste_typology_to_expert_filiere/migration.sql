insert into organism_on_domaine(organism_id,domaine_id) select o.id,d.id from organism o,domaine d where o.typology='generaliste';

update organism set typology='expertFiliere' where typology='generaliste';


insert into maison_mere_aap_on_domaine(maison_mere_aap_id,domaine_id) select m.id,d.id from maison_mere_aap m,domaine d where m.typologie='generaliste';

update maison_mere_aap set typologie='expertFiliere' where typologie='generaliste';
