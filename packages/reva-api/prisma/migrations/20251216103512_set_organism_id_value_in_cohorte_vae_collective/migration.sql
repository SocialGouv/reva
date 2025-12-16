update cohorte_vae_collective
set
    organism_id = (
        select
            organism_id
        from
            certification_vae_collective,
            certification_vae_collective_on_organism
        where
            certification_vae_collective.id in (
                select
                    id
                from
                    certification_vae_collective c
                where
                    c.cohorte_vae_collective_id = certification_vae_collective.cohorte_vae_collective_id
                limit
                    1
            )
            and certification_vae_collective_on_organism.id = (
                select
                    id
                from
                    certification_vae_collective_on_organism c2
                where
                    c2.certification_cohorte_vae_collective_id = certification_vae_collective.id
                limit
                    1
            )
            and certification_vae_collective.cohorte_vae_collective_id = cohorte_vae_collective.id
    );