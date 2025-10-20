insert into
    organism_on_account (organism_id, account_id)
select
    organism_id,
    id
from
    account
where
    organism_id is not null;