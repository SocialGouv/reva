-- payment request reva
update payment_request
set
    confirmed_at = (
        select
            candidacy_candidacy_status.created_at
        from
            candidacy_candidacy_status
        where
            candidacy_candidacy_status.candidacy_id = payment_request.candidacy_id
            and candidacy_candidacy_status.status = 'DEMANDE_PAIEMENT_ENVOYEE'
        order by
            candidacy_candidacy_status.created_at desc
        limit
            1
    );

-- payment request unifvae
update payment_request_unifvae
set
    confirmed_at = (
        select
            candidacy_candidacy_status.created_at
        from
            candidacy_candidacy_status
        where
            candidacy_candidacy_status.candidacy_id = payment_request_unifvae.candidacy_id
            and candidacy_candidacy_status.status = 'DEMANDE_PAIEMENT_ENVOYEE'
        order by
            candidacy_candidacy_status.created_at desc
        limit
            1
    );

update payment_request_unifvae
set
    confirmed_at = (
        select
            payment_request_batch_unifvae.created_at
        from
            payment_request_batch_unifvae
        where
            payment_request_batch_unifvae.payment_request_id = payment_request_unifvae.id
        order by
            payment_request_batch_unifvae.created_at desc
    )
where
    payment_request_unifvae.confirmed_at is null;