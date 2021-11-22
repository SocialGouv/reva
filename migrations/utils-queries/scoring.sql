-- Compare calculated max with max in measure table

select m.id, m.label, m.factor, m.min, m.max, sum(score.max) as calculated_max
from measures m,
(select m.id as measure_id, m.label, ma.question_id ,greatest(max(ma.score), 0) as max
    from measures_answers ma,
        measures m
    where ma.measure_id = m.id
    group by m.id, m.label, ma.question_id) as score
where m.id = score.measure_id
group by m.id, m.label, m.factor, m.min, m.max;


-- Get all answers with measures and score for each

select  ma.survey_id, ma.question_id, ma.answer_id, ma.measure_id, q.label, a.label, m.label, m.indicator, m.factor, m.min, m.max, ma.score
from measures_answers ma, 
    measures m,
    surveys s, 
    jsonb_to_recordset(s.questions) as q(id UUID, label varchar(255), answers jsonb, "order" int), 
    jsonb_to_recordset(q.answers) as a(id UUID, label varchar(255), "order" int)
where m.id = ma.measure_id
and s.id = ma.survey_id
and s.latest = true
and q.id = ma.question_id
and a.id = ma.answer_id
order by q.order, a.order, m.label,  m.indicator;


-- Repartion by Grades

select 
    CASE 
      WHEN (ca.score->'grades'->>'obtainment')::float >= 0.89431  THEN 'A'
      WHEN (ca.score->'grades'->>'obtainment')::float >= 0.72358 THEN 'B'
      WHEN (ca.score->'grades'->>'obtainment')::float >= 0.44716  THEN 'C'
      ELSE 'D'
    END as obtainment, 
    CASE 
      WHEN (ca.score->'grades'->>'profile')::float >= 0.89431  THEN 'A'
      WHEN (ca.score->'grades'->>'profile')::float >= 0.72358 THEN 'B'
      WHEN (ca.score->'grades'->>'profile')::float >= 0.44716  THEN 'C'
      ELSE 'D'
    END  as profile, count(1) as total
from candidate_answers ca
where ca.score is not null
group by obtainment, profile 
order by total desc;
-- order by obtainment asc, profile asc;