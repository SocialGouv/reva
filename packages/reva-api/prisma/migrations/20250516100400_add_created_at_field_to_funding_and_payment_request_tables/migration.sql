-- AlterTable
ALTER TABLE "funding_request"
ADD COLUMN "created_at" TIMESTAMPTZ (6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "funding_request_unifvae"
ADD COLUMN "created_at" TIMESTAMPTZ (6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "payment_request"
ADD COLUMN "created_at" TIMESTAMPTZ (6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "payment_request_unifvae"
ADD COLUMN "created_at" TIMESTAMPTZ (6) DEFAULT CURRENT_TIMESTAMP;

-- funding request reva
update funding_request
set
    created_at = null;

update funding_request
set
    created_at = (
        select
            created_at
        from
            candidacy_log
        where
            candidacy_id = funding_request.candidacy_id
            and event_type = 'FUNDING_REQUEST_CREATED'
        order by
            created_at desc
        limit
            1
    );

update funding_request
set
    created_at = (
        select
            created_at
        from
            candidacy_candidacy_status
        where
            candidacy_id = funding_request.candidacy_id
            and status = 'DEMANDE_FINANCEMENT_ENVOYE'
        order by
            created_at desc
        limit
            1
    )
where
    funding_request.created_at is null;

--funding request unifvae
update funding_request_unifvae
set
    created_at = null;

update funding_request_unifvae
set
    created_at = (
        select
            created_at
        from
            candidacy_log
        where
            candidacy_id = funding_request_unifvae.candidacy_id
            and event_type = 'FUNDING_REQUEST_CREATED'
        order by
            created_at desc
        limit
            1
    );

update funding_request_unifvae
set
    created_at = (
        select
            created_at
        from
            candidacy_candidacy_status
        where
            candidacy_id = funding_request_unifvae.candidacy_id
            and status = 'DEMANDE_FINANCEMENT_ENVOYE'
        order by
            created_at desc
        limit
            1
    )
where
    funding_request_unifvae.created_at is null;

-- payment request reva
update payment_request
set
    created_at = null;

update payment_request
set
    created_at = (
        select
            created_at
        from
            candidacy_log
        where
            candidacy_id = payment_request.candidacy_id
            and event_type = 'PAYMENT_REQUEST_CREATED_OR_UPDATED'
        order by
            created_at desc
        limit
            1
    );

update payment_request
set
    created_at = (
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
    )
where
    payment_request.created_at is null;

-- payment request unifvae
update payment_request_unifvae
set
    created_at = null;

update payment_request_unifvae
set
    created_at = (
        select
            created_at
        from
            candidacy_log
        where
            candidacy_id = payment_request_unifvae.candidacy_id
            and event_type = 'PAYMENT_REQUEST_CREATED_OR_UPDATED'
        order by
            created_at desc
        limit
            1
    );

update payment_request_unifvae
set
    created_at = (
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
    payment_request_unifvae.created_at is null;

update payment_request_unifvae
set
    created_at = (
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
    payment_request_unifvae.created_at is null;