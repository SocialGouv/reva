CREATE VIEW available_certification_by_department AS
SELECT DISTINCT c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o
WHERE o.typology = 'generaliste'
    AND o.is_active = true
    AND c.status = 'AVAILABLE';