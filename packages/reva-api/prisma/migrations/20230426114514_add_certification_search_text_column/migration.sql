-- immutable version of unaccent. Generated column wont work without it
CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $func$
SELECT unaccent('unaccent', $1) $func$;
-- certification
ALTER TABLE "certification"
ADD COLUMN "searchable_text" tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'french',
            immutable_unaccent(
                coalesce(label, '') || ' ' || coalesce(summary, '')
            )
        )
    ) STORED;
-- available_certification_by_department
-- used by candidate app to view available certification for a given department
-- updated to add certification_searchable_text
CREATE OR REPLACE VIEW available_certification_by_department AS -- generaliste
SELECT DISTINCT cer.id as certification_id,
    dep.id as department_id,
    cer.searchable_text as certification_searchable_text
FROM certification cer,
    department dep,
    organism org,
    organism_department org_dep
WHERE org.typology = 'generaliste'
    AND org.is_active = true
    AND cer.status = 'AVAILABLE'
    AND org_dep.organism_id = org.id
    AND org_dep.department_id = dep.id
UNION
DISTINCT --
-- expert filiere
SELECT DISTINCT cer.id as certification_id,
    dep.id as department_id,
    cer.searchable_text as certification_searchable_text
FROM certification cer,
    department dep,
    organism org,
    domaine dom,
    organism_on_domaine org_dom,
    certification_on_domaine cer_dom,
    organism_department org_dep
WHERE org.typology = 'expertFiliere'
    AND org.is_active = true
    AND cer.status = 'AVAILABLE'
    AND org_dom.organism_id = org.id
    AND org_dom.domaine_id = dom.id
    AND cer_dom.certification_id = cer.id
    AND cer_dom.domaine_id = dom.id
    AND org_dep.organism_id = org.id
    AND org_dep.department_id = dep.id
UNION
DISTINCT --
-- expert branche
SELECT DISTINCT cer.id as certification_id,
    dep.id as department_id,
    cer.searchable_text as certification_searchable_text
FROM certification cer,
    department dep,
    organism org,
    convention_collective ccn,
    organism_on_ccn org_ccn,
    certification_on_ccn cer_ccn,
    organism_department org_dep
WHERE org.typology = 'expertBranche'
    AND org.is_active = true
    AND cer.status = 'AVAILABLE'
    AND org_ccn.organism_id = org.id
    AND org_ccn.ccn_id = ccn.id
    AND cer_ccn.certification_id = cer.id
    AND cer_ccn.ccn_id = ccn.id
    AND org_dep.organism_id = org.id
    AND org_dep.department_id = dep.id;