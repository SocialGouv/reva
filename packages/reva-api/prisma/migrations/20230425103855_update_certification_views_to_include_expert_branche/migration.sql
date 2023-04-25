-- available_certification_by_department
--used by candidate app to view availales certification for a given department
CREATE OR REPLACE VIEW available_certification_by_department AS --
--generaliste
SELECT DISTINCT c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o
WHERE o.typology = 'generaliste'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
UNION
DISTINCT --
--expert filiere
SELECT DISTINCT c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o,
    domaine dom,
    organism_on_domaine od,
    certification_on_domaine cd
WHERE o.typology = 'expertFiliere'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
    AND o.id = od.organism_id
    AND od.domaine_id = dom.id
    AND c.id = cd.certification_id
    AND cd.domaine_id = dom.id
UNION
DISTINCT --
-- expert branche
SELECT DISTINCT c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o,
    convention_collective ccn,
    organism_on_ccn ooccn,
    certification_on_ccn coccn
WHERE o.typology = 'expertBranche'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
    AND o.id = ooccn.organism_id
    AND c.id = coccn.ccn_id
    AND coccn.ccn_id = ccn.id;

--
--active_organism_by_available_certification_and_department
--used by candidate app to view active organisms for a given department and a given certificate
CREATE OR REPLACE VIEW active_organism_by_available_certification_and_department AS
SELECT DISTINCT o.id as organism_id,
    c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o
WHERE o.typology = 'generaliste'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
UNION
DISTINCT -- 
--expert filiere
SELECT DISTINCT o.id as organism_id,
    c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o,
    domaine dom,
    organism_on_domaine od,
    certification_on_domaine cd
WHERE o.typology = 'expertFiliere'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
    AND o.id = od.organism_id
    AND od.domaine_id = dom.id
    AND c.id = cd.certification_id
    AND cd.domaine_id = dom.id
UNION
DISTINCT --
-- expert branche
SELECT DISTINCT o.id as organisme_id,
    c.id as certification_id,
    d.id as department_id
FROM certification c,
    department d,
    organism o,
    convention_collective ccn,
    organism_on_ccn ooccn,
    certification_on_ccn coccn
WHERE o.typology = 'expertBranche'
    AND o.is_active = true
    AND c.status = 'AVAILABLE'
    AND o.id = ooccn.organism_id
    AND c.id = coccn.ccn_id
    AND coccn.ccn_id = ccn.id;
