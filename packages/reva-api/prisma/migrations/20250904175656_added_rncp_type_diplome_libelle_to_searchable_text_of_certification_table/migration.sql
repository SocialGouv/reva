BEGIN;

DROP VIEW available_certification_based_on_formacode;
DROP VIEW active_organism_by_available_certification_based_on_formacode;

ALTER TABLE "certification" DROP COLUMN "searchable_text";
ALTER TABLE "certification"
ADD COLUMN "searchable_text" tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'simple',
            immutable_unaccent(
                (((COALESCE(label, ''::character varying))::text || ' '::text) || ((COALESCE(rncp_id, ''::character varying))::text || ' '::text) || ((COALESCE(rncp_type_diplome, ''::character varying))::text || ' '::text))
            )
        )
    ) STORED;

-- available_certification
-- used by candidate app to view available certification
CREATE
OR REPLACE VIEW available_certification_based_on_formacode AS
-- expert filiere and expertBrancheEtFiliere filiere part
SELECT DISTINCT
    cer.id as certification_id,
    cer.searchable_text as certification_searchable_text
FROM
    certification cer,
    organism org
    LEFT JOIN maison_mere_aap mma ON org.maison_mere_aap_id = mma.id,
    formacode code,
    organism_on_formacode org_code,
    certification_on_formacode cer_code,
    organism_on_degree org_degree,
    degree degree
WHERE
    (
        org.typology = 'expertFiliere'
        or org.typology = 'expertBrancheEtFiliere' -- "expertBrancheEtFiliere" is both "expertBranche" and "expertFiliere"
    )
    AND code.type = 'SUB_DOMAIN'
    AND mma.is_active = true
    AND org.ferme_pour_absence_ou_conges = false
    AND cer.visible = true
    AND org_code.organism_id = org.id
    AND org_code.formacode_id = code.id
    AND cer_code.certification_id = cer.id
    AND cer_code.formacode_id = code.id
    AND org_degree.organism_id = org.id
    AND org_degree.degree_id = degree.id
    AND degree.level = cer.level
    AND NOT EXISTS (
        select
            certification_on_ccn.certification_id
        from
            certification_on_ccn
        where
            certification_on_ccn.certification_id = cer.id
    )
UNION DISTINCT --
-- expert branche and expertBrancheEtFiliere branche part
SELECT DISTINCT
    cer.id as certification_id,
    cer.searchable_text as certification_searchable_text
FROM
    certification cer,
    organism org
    LEFT JOIN maison_mere_aap mma ON org.maison_mere_aap_id = mma.id,
    convention_collective ccn,
    organism_on_ccn org_ccn,
    certification_on_ccn cer_ccn,
    organism_on_degree org_degree,
    degree degree
WHERE
    (
        org.typology = 'expertBranche'
        or org.typology = 'expertBrancheEtFiliere' -- "expertBrancheEtFiliere" is both "expertBranche" and "expertFiliere"
    )
    AND mma.is_active = true
    AND org.ferme_pour_absence_ou_conges = false
    AND cer.visible = true
    AND org_ccn.organism_id = org.id
    AND org_ccn.ccn_id = ccn.id
    AND cer_ccn.certification_id = cer.id
    AND cer_ccn.ccn_id = ccn.id
    AND org_degree.organism_id = org.id
    AND org_degree.degree_id = degree.id
    AND degree.level = cer.level;

--active_organism_by_available_certification
--used by candidate app to view active organisms for a given certificate
CREATE
OR REPLACE VIEW active_organism_by_available_certification_based_on_formacode AS
--expert filiere and expertBrancheEtFiliere filiere part
SELECT DISTINCT
    org.id as organism_id,
    cer.id as certification_id,
    cer.searchable_text as certification_searchable_text
FROM
    certification cer,
    organism org
    LEFT JOIN maison_mere_aap mma ON org.maison_mere_aap_id = mma.id,
    formacode code,
    organism_on_formacode org_code,
    certification_on_formacode cer_code,
    organism_on_degree org_degree,
    degree degree
WHERE
    (
        org.typology = 'expertFiliere'
        or org.typology = 'expertBrancheEtFiliere' -- "expertBrancheEtFiliere" is both "expertBranche" and "expertFiliere"
    )
    AND code.type = 'SUB_DOMAIN'
    AND mma.is_active = true
    AND org.ferme_pour_absence_ou_conges = false
    AND cer.visible = true
    AND org_code.organism_id = org.id
    AND org_code.formacode_id = code.id
    AND cer_code.certification_id = cer.id
    AND cer_code.formacode_id = code.id
    AND org_degree.organism_id = org.id
    AND org_degree.degree_id = degree.id
    AND degree.level = cer.level
    AND NOT EXISTS (
        select
            certification_on_ccn.certification_id
        from
            certification_on_ccn
        where
            certification_on_ccn.certification_id = cer.id
    )
UNION DISTINCT --
-- expert branche and expertBrancheEtFiliere branche part
SELECT DISTINCT
    org.id as organisme_id,
    cer.id as certification_id,
    cer.searchable_text as certification_searchable_text
FROM
    certification cer,
    organism org
    LEFT JOIN maison_mere_aap mma ON org.maison_mere_aap_id = mma.id,
    convention_collective ccn,
    organism_on_ccn org_ccn,
    certification_on_ccn cer_ccn,
    organism_on_degree org_degree,
    degree degree
WHERE
    (
        org.typology = 'expertBranche'
        or org.typology = 'expertBrancheEtFiliere' -- "expertBrancheEtFiliere" is both "expertBranche" and "expertFiliere"
    )
    AND mma.is_active = true
    AND org.ferme_pour_absence_ou_conges = false
    AND cer.visible = true
    AND org_ccn.organism_id = org.id
    AND org_ccn.ccn_id = ccn.id
    AND cer_ccn.certification_id = cer.id
    AND cer_ccn.ccn_id = ccn.id
    AND org_degree.organism_id = org.id
    AND org_degree.degree_id = degree.id
    AND degree.level = cer.level;

COMMIT;
