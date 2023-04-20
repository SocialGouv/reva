CREATE VIEW active_organism_by_available_certification_and_department AS
SELECT DISTINCT o.id as organism_id,
    c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o
WHERE o.typology = 'generaliste'
    AND o.is_active = true
    AND c.status = 'AVAILABLE';