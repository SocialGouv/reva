update candidacy_drop_out
set
    status = (
        select
            candidacy_candidacy_status.status
        from
            candidacy_candidacy_status
        where
            candidacy_candidacy_status.candidacy_id = candidacy_drop_out.candidacy_id
            and candidacy_candidacy_status.status != 'DEMANDE_FINANCEMENT_ENVOYE'
            and candidacy_candidacy_status.status != 'DEMANDE_PAIEMENT_ENVOYEE'
            and candidacy_candidacy_status.created_at < candidacy_drop_out.created_at
        order by
            created_at desc
        limit
            1
    )
where
    candidacy_drop_out.status = 'DEMANDE_FINANCEMENT_ENVOYE'
    or candidacy_drop_out.status = 'DEMANDE_PAIEMENT_ENVOYEE';