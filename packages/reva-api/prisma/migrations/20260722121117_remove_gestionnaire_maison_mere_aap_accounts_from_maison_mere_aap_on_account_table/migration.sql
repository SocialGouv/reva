delete from maison_mere_aap_on_account
where
    (account_id, maison_mere_aap_id) in (
        select
            gestionnaire_account_id,
            id
        from
            maison_mere_aap
    );