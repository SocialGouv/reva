-- delete candidacy_on_candidacy_financing_method records whith more than one candidacy_financing_method per candidacy since we dont knoww
-- how to compute the correct amount from the candidacy estimated_cost field
delete from candidacy_on_candidacy_financing_method
where
    candidacy_id in (
        select
            candidacy_id
        from
            candidacy_on_candidacy_financing_method
        group by
            candidacy_id
        having
            count(candidacy_financing_method) > 1
    );

-- copy the estimated_cost from the candidacy table to the sole candidacy_on_candidacy_financing_method amount field
update candidacy_on_candidacy_financing_method
set
    amount = (
        select
            estimated_cost
        from
            candidacy
        where
            candidacy.id = candidacy_on_candidacy_financing_method.candidacy_id
    );