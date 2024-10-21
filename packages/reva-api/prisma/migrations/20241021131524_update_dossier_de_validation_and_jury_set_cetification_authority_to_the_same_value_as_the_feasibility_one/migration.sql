-- update active dossier de validation and jury records wich have a different certification_authority_id than the one in the feasibility record
update dossier_de_validation
set
    certification_authority_id = (
        select
            certification_authority_id
        from
            feasibility
        where
            feasibility.is_active
            and feasibility.candidacy_id = dossier_de_validation.candidacy_id
    )
where
    dossier_de_validation.is_active
    and dossier_de_validation.certification_authority_id <> (
        select
            certification_authority_id
        from
            feasibility
        where
            feasibility.is_active
            and feasibility.candidacy_id = dossier_de_validation.candidacy_id
    );

update jury
set
    certification_authority_id = (
        select
            certification_authority_id
        from
            feasibility
        where
            feasibility.is_active
            and feasibility.candidacy_id = jury.candidacy_id
    )
where
    jury.is_active
    and jury.certification_authority_id <> (
        select
            certification_authority_id
        from
            feasibility
        where
            feasibility.is_active
            and feasibility.candidacy_id = jury.candidacy_id
    );