update candidacy
set
    status = (
        select
            status
        from
            candidacy_candidacy_status
        where
            is_active
            and candidacy_id = candidacy.id
        limit
            1
    );