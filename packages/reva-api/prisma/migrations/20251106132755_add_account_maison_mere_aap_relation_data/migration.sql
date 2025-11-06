insert into
    "maison_mere_aap_on_account" ("account_id", "maison_mere_aap_id")
select distinct
    (account_id),
    maison_mere_aap_id
from
    organism_on_account
    join organism on organism.id = organism_on_account.organism_id
where
    maison_mere_aap_id is not null;