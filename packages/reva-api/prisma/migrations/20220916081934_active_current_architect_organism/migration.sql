UPDATE organism 
SET is_active = true
WHERE organism.id IN (
    SELECT DISTINCT o.id
    FROM organism o
    INNER JOIN organism_region_certification orc ON orc.organism_id = o.id
    INNER JOIN certification c ON c.id = orc.certification_id
    WHERE c.status = 'AVAILABLE'
    AND orc.is_architect = true
);