-- AlterTable
ALTER TABLE "payment_request"
ADD COLUMN "confirmed_at" TIMESTAMPTZ (6);

-- AlterTable
ALTER TABLE "payment_request_unifvae"
ADD COLUMN "confirmed_at" TIMESTAMPTZ (6);

-- payment request reva
update payment_request
set
    confirmed_at = (
        select
            created_at
        from
            candidacy_candidacy_status
        where
            candidacy_id = payment_request.candidacy_id
            and status = 'DEMANDE_PAIEMENT_ENVOYEE'
        order by
            created_at desc
        limit
            1
    );

-- payment request unifvae
update payment_request_unifvae
set
    confirmed_at = (
        select
            created_at
        from
            candidacy_candidacy_status
        where
            candidacy_id = payment_request_unifvae.candidacy_id
            and status = 'DEMANDE_PAIEMENT_ENVOYEE'
        order by
            created_at desc
        limit
            1
    )
where
    payment_request_unifvae.confirmed_at is null;

update payment_request_unifvae
set
    confirmed_at = (
        select
            created_at
        from
            payment_request_batch_unifvae
        where
            candidacy_id = payment_request_unifvae.candidacy_id
        order by
            created_at desc
        limit
            1
    )
where
    payment_request_unifvae.confirmed_at is null;