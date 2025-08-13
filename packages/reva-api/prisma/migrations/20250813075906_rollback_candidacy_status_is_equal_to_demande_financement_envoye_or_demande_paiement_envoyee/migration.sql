update candidacy
set
    status = (
        select
            candidacy_candidacy_status.status
        from
            candidacy_candidacy_status
        where
            candidacy_candidacy_status.candidacy_id = candidacy.id
            and status != 'DEMANDE_FINANCEMENT_ENVOYE'
            and status != 'DEMANDE_PAIEMENT_ENVOYEE'
        order by
            created_at desc
        limit
            1
    )
where
    candidacy.status = 'DEMANDE_FINANCEMENT_ENVOYE'
    or candidacy.status = 'DEMANDE_PAIEMENT_ENVOYEE';