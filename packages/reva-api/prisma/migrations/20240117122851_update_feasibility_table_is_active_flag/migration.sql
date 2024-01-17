update feasibility set is_active=false;
update feasibility set is_active=true where feasibility.created_at = (select max(f2.created_at) from feasibility f2 where f2.candidacy_id=feasibility.candidacy_id group by f2.candidacy_id);
