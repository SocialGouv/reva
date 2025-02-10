-- CREATION DES TABLES DE NIVEAU 3 

-- table pour suivre par candidature les jours des étapes du parcours VAE 
CREATE TABLE "data_level_3"."candidatures_par_dates" AS -- table de recevabilite
(
    WITH candidacy_validees AS -- filtre pour ne sélectionner que les candidatures validées
        (
            SELECT
                candidacy_candidacy_status.candidacy_id as candidacy_id,
                MIN(candidacy_candidacy_status.created_at) AS date_validation
            FROM candidacy_candidacy_status
            JOIN candidacy on candidacy_candidacy_status.candidacy_id = candidacy.id 
            WHERE ((candidacy_candidacy_status.status = 'VALIDATION' AND finance_module != 'unireva') OR type_accompagnement = 'AUTONOME')
            GROUP BY candidacy_id
        ),date_creation_candidature AS 
        (
            SELECT 
                id AS candidacy_id, 
                created_at AS date_creation_candidature
            FROM candidacy
        ),date_premier_rendez_vous AS -- depuis les logs
        (
            SELECT
                candidacy_id,
                min(created_at) AS date_premier_rendez_vous
            FROM (SELECT * FROM candidacy_log WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered
            WHERE event_type = 'APPOINTMENT_INFO_UPDATED'
            GROUP BY 1
        ), date_candidature_soumise AS -- contient la date à laquelle une candidature a été soumise (validation)
        (
            SELECT
                candidacy_id,
                MIN(created_at) AS date_soumission
            FROM (SELECT * FROM candidacy_candidacy_status WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered-- ne prendre que les IDs validés pendant le Q423
            WHERE status IN ('VALIDATION') 
            GROUP BY 1
        ), date_candidature_prise_en_charge AS -- contient la date à laquelle une candidature a été prise en charge
        (
            SELECT
                candidacy_id,
                MIN(created_at) AS date_prise_en_charge
            FROM (SELECT * FROM candidacy_candidacy_status WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered-- ne prendre que les IDs validés pendant le Q423
            WHERE status IN ('PRISE_EN_CHARGE')
            GROUP BY 1
        ), date_df_envoye AS -- contient la date à laquelle le dossier de recevabilité a été envoye
        (
        SELECT
            candidacy_id,
            MAX(created_at) AS date_df_envoye
        FROM 
            (SELECT candidacy_candidacy_status.candidacy_id,
                    candidacy_candidacy_status.created_at,
                    candidacy_candidacy_status.status
            FROM candidacy_candidacy_status 
            JOIN candidacy ON candidacy.id = candidacy_candidacy_status.candidacy_id
            WHERE (candidacy_candidacy_status.candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) OR candidacy.type_accompagnement = 'AUTONOME' --- ne prendre que les IDs validés pendant le Q423 et les candidats autonomes
            ) AS candidacy_filtered
        WHERE status = 'DOSSIER_FAISABILITE_ENVOYE' 
        GROUP BY 1
        ), date_de_recevabilite AS 
        (    SELECT
                candidacy_id,
                MAX(decision_sent_at) AS date_de_recevabilite
            FROM feasibility
            WHERE (decision = 'ADMISSIBLE' OR decision = 'REJECTED') 
            GROUP BY candidacy_id
        ), date_envoi_demande_financement AS -- contient la date à laquelle la demande de financement a été envoyée
        (
            SELECT
                demande_fin.candidacy_id,
                demande_fin.date_envoi_demande_financement,
                data_num_df.num_action
            FROM
            (
                SELECT
                    candidacy_id,
                    MIN(created_at) AS date_envoi_demande_financement
                FROM (SELECT * FROM candidacy_candidacy_status WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered-- ne prendre que les IDs validés pendant le Q423
                WHERE status IN ('DEMANDE_FINANCEMENT_ENVOYE')
                GROUP BY 1
            ) AS demande_fin
            LEFT JOIN (SELECT candidacy_id, num_action FROM funding_request_unifvae GROUP BY 1, 2) AS data_num_df
                ON demande_fin.candidacy_id = data_num_df.candidacy_id
        ), date_envoi_demande_paiement AS -- contient la date à laquelle la demande de paiement a été envoyée
        (
            SELECT
                demande_paiement.candidacy_id,
                demande_paiement.date_envoi_demande_paiement,
                data_num_dp.invoice_number as invoice_number
            FROM
            (
                SELECT
                    candidacy_id,
                    MIN(created_at) AS date_envoi_demande_paiement
                FROM (SELECT * FROM candidacy_candidacy_status WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered-- ne prendre que les IDs validés pendant le Q423
                WHERE status IN ('DEMANDE_PAIEMENT_ENVOYEE')
                GROUP BY 1
            ) AS demande_paiement
            LEFT JOIN (SELECT candidacy_id, invoice_number FROM payment_request_unifvae GROUP BY 1, 2) AS data_num_dp
                ON demande_paiement.candidacy_id = data_num_dp.candidacy_id
        ),date_candidature_envoi_dv AS -- contient la date à laquelle une candidature a son dossier de validation envoye et qui marque le début d'attente du jury
        (
            SELECT
                candidacy_id,
                MAX(created_at) AS date_envoi_dv
            FROM (SELECT * FROM candidacy_candidacy_status WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees)) AS candidacy_filtered-- ne prendre que les IDs validés pendant le Q423
            WHERE status IN ('DOSSIER_DE_VALIDATION_ENVOYE')
            GROUP BY 1
        ), dates_jury AS 
        (    SELECT
                candidacy_id,
                date_of_session AS date_of_exam,
                date_of_result
            FROM jury
            WHERE is_active = true
        )
        SELECT 
            date_creation_candidature.candidacy_id, 
            date_creation_candidature, 
            date_soumission,
            date_prise_en_charge,
            date_premier_rendez_vous,
            date_df_envoye, 
            date_envoi_demande_financement, 
            date_de_recevabilite, 
            date_envoi_dv,
            date_of_exam, 
            date_of_result, 
            date_envoi_demande_paiement, 
            num_action, 
            invoice_number
        FROM date_creation_candidature
        LEFT JOIN date_candidature_soumise
            ON date_candidature_soumise.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_candidature_prise_en_charge 
            ON date_candidature_prise_en_charge.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_premier_rendez_vous 
            ON date_premier_rendez_vous.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_df_envoye 
            ON date_df_envoye.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_envoi_demande_financement
            ON date_envoi_demande_financement.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_de_recevabilite
            ON date_de_recevabilite.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_candidature_envoi_dv
            ON date_candidature_envoi_dv.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN dates_jury
            ON dates_jury.candidacy_id = date_creation_candidature.candidacy_id
        LEFT JOIN date_envoi_demande_paiement
            ON date_envoi_demande_paiement.candidacy_id = date_creation_candidature.candidacy_id
    );


   
   
    -- table de creation du modele candidature

    CREATE TABLE "data_level_3"."modele_candidatures" AS 
    (
        WITH dimensions_utiles AS -- table qui contient les dernieres infos de dimensions sur les candidatures encore dans la table candidature
        (
        SELECT
        candidacy.id AS candidacy_id,
        candidacy.organism_id,
        candidacy.candidate_id,
        candidate.email,
        candidate.department_id,
        candidacy.ccn_id,
        candidacy.typology::text,
        candidacy.appointment_count,
        candidacy.first_appointment_occured_at,
        candidacy.finance_module::text,
        candidacy.type_accompagnement::text, 
        candidacy.feasibility_format::text, 
        candidacy.created_at AS date_creation_candidature, 
        certification.id AS certification_id,
        certification.rncp_id AS certification_rncp_id,
        certification.label AS certification_label,
        certification_authority_structure_id AS certificateur_id,
        certification_authority_structure.label AS certificateur_label,
            CASE
                WHEN certification_authority_structure.label LIKE '%Ministère de l''Agriculture et de la Souveraineté alimentaire' THEN 'Agriculture'
                WHEN certification_authority_structure.label LIKE '%Ministère de la Santé%' THEN 'Santé'
                WHEN certification_authority_structure.label = 'IPERIA' THEN 'IPERIA'
                WHEN certification_authority_structure.label = 'UIMM' THEN 'CPNEFP métallurgie'
                WHEN certification_authority_structure.label LIKE '%Ministère de l''Education%' THEN 'Education Nationale'
                WHEN certification_authority_structure.label LIKE '%Ministère des Solidarités%' THEN 'Solidarités'
                WHEN certification_authority_structure.label = 'OCSport' THEN 'OCSport'
                WHEN certification_authority_structure.label LIKE '%Ministère des Sports%' THEN 'Sport'
                WHEN certification_authority_structure.label LIKE '%Ministère du Travail%' THEN 'Travail'
                WHEN certification_authority_structure.label LIKE 'XELYA%' THEN 'CNEAP'
                WHEN certification_authority_structure.label LIKE '%Ministère de l''Enseignement Supérieur et de la Recherche%' THEN 'Enseignement Supérieur'
                WHEN certification_authority_structure.label IS NULL OR certification_authority_structure.label = '' THEN ''
                ELSE 'Autre'
            END AS certificateur_name
        FROM candidacy
        LEFT JOIN candidate
            ON candidacy.candidate_id = candidate.id
        LEFT JOIN certification 
            ON candidacy.certification_id = certification.id 
        LEFT JOIN certification_authority_structure 
            ON certification_authority_structure.id = certification.certification_authority_structure_id
    ), projets AS (
        SELECT 
            candidacy_id, 
            candidacy_candidacy_status.status::text AS current_status, 
            max(candidacy_candidacy_status.created_at) AS created_at_current_status
        FROM candidacy_candidacy_status
        WHERE is_active is true AND status = 'PROJET' 
        GROUP BY 1, 2
    ), candidacy_validees AS -- filtre pour ne sélectionner que les candidatures validées
    (
        SELECT
        candidacy_candidacy_status.candidacy_id as candidacy_id,
        MIN(candidacy_candidacy_status.created_at) AS date_validation
        FROM candidacy_candidacy_status
        JOIN candidacy on candidacy_candidacy_status.candidacy_id = candidacy.id 
        WHERE ((candidacy_candidacy_status.status = 'VALIDATION' AND finance_module != 'unireva') OR type_accompagnement = 'AUTONOME')
        AND candidacy_candidacy_status.candidacy_id NOT IN (SELECT candidacy_id FROM projets)
        GROUP BY candidacy_id
        
    -- création de tables séparées contenant les infos des dates clefs ou des status clefs (abandon / archives etc) pour pouvoir les ramener en colonne ensuite dans la table Statut

    ), candidatures_archivees AS -- contient les candidatures archivées
    (
        SELECT
            candidacy_id,
            status::text AS current_status,
            min(created_at) AS archive_date
        FROM candidacy_candidacy_status 
        WHERE is_active IS true AND status = 'ARCHIVE'
        GROUP BY 1, 2
    ), dates_candidatures AS 
    (
        SELECT 
            data_level_3.candidatures_par_dates.candidacy_id, 
            date_creation_candidature, 
            date_soumission, 
            date_prise_en_charge, 
            date_premier_rendez_vous, 
            date_df_envoye, 
            date_envoi_demande_financement, 
            date_de_recevabilite, 
            date_envoi_dv, 
            date_of_exam, 
            date_of_result, 
            date_envoi_demande_paiement, 
            data_num_df.num_action, 
            data_num_dp.invoice_number as invoice_number
        FROM data_level_3.candidatures_par_dates
        LEFT JOIN (SELECT candidacy_id, num_action FROM funding_request_unifvae GROUP BY 1, 2) AS data_num_df
            ON data_level_3.candidatures_par_dates.candidacy_id = data_num_df.candidacy_id
        LEFT JOIN (SELECT candidacy_id, invoice_number FROM payment_request_unifvae GROUP BY 1, 2) AS data_num_dp
            ON data_level_3.candidatures_par_dates.candidacy_id = data_num_dp.candidacy_id

    ), jury_gip AS
    (
        SELECT
            candidacy_id,
            result::text,
            CASE
                WHEN CAST(result AS text) = 'PARTIAL_SUCCESS_OF_FULL_CERTIFICATION' OR CAST(result AS text) = 'PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION'
                    THEN 'PARTIAL_SUCCESS'
                WHEN CAST(result AS text) = 'FULL_SUCCESS_OF_FULL_CERTIFICATION' OR CAST(result AS text) = 'FULL_SUCCESS_OF_PARTIAL_CERTIFICATION'
                    THEN 'SUCCESS'
                WHEN CAST(result AS text) = 'CANDIDATE_EXCUSED' OR CAST(result AS text) = 'CANDIDATE_ABSENT'
                    THEN 'ABSENCE'
                ELSE CAST(result AS text)
            END AS result_simplified,
            date_of_session AS date_of_exam,
            date_of_result
        FROM jury
        WHERE is_active = true
        GROUP BY 1, 2, 3, 4, 5
    ), candidacy_status AS (
        SELECT 
            candidacy_candidacy_status.candidacy_id AS candidacy_id,
            candidacy.status::text AS current_status,
            max(candidacy_candidacy_status.created_at) AS created_at_current_status
        FROM candidacy_candidacy_status 
        JOIN candidacy ON candidacy.id = candidacy_candidacy_status.candidacy_id AND candidacy.status = candidacy_candidacy_status.status
        WHERE candidacy_id IN (SELECT candidacy_id FROM candidacy_validees) and is_active = true 
        GROUP BY 1, 2
    ), candidacy_data AS
    (
        SELECT
            candidacy_validees.candidacy_id,
            candidacy_status.current_status, -- à voir comment on traite car ne reflète pas les abandons
            candidacy_status.created_at_current_status,
            -- infos d'archives
            CASE
                WHEN candidatures_archivees.candidacy_id IS NULL THEN false
                WHEN jury_gip.result IS NOT NULL THEN false
                ELSE true
            END AS is_archive,
            -- infos d'abandons
            CASE
                WHEN data_level_2.drop_outs.candidacy_id IS NULL THEN false
                ELSE true
                END AS is_abandon,
            data_level_2.drop_outs.drop_out_reason,
            data_level_2.drop_outs.drop_out_status,
            data_level_2.drop_outs.date_abandon,
            -- infos de recevabilité
            CASE
                WHEN CAST(data_level_2.recevabilite.decision AS text) = 'ADMISSIBLE' THEN true
                WHEN CAST(data_level_2.recevabilite.decision AS text) = 'REJECTED' THEN false
                ELSE NULL
            END AS is_recevable,
            -- structuration des dates clefs de parcours
            date_soumission,
            date_prise_en_charge,
            CASE 
                WHEN least(date_premier_rendez_vous, first_appointment_occured_at) < date_prise_en_charge THEN date_prise_en_charge 
                WHEN least(date_premier_rendez_vous, first_appointment_occured_at) >  date_df_envoye THEN date_df_envoye 
                ELSE least(date_premier_rendez_vous, first_appointment_occured_at)
            END AS date_premier_rendez_vous,
            CASE
                WHEN data_level_3.candidatures_par_dates.candidacy_id IS NOT NULL THEN data_level_3.candidatures_par_dates.date_df_envoye
                WHEN data_level_2.recevabilite.candidacy_id IS NOT NULL THEN GREATEST(CAST(CAST(data_level_3.candidatures_par_dates.date_de_recevabilite AS DATE) - INTERVAL '10 days' AS DATE), CAST(date_prise_en_charge AS DATE))
                ELSE NULL
            END AS date_df_envoye,
            data_level_3.candidatures_par_dates.date_df_envoye AS date_df_envoye_initiale,
            date_envoi_demande_financement,
            date_envoi_demande_paiement,
            num_action,
            invoice_number,
            cohorte_uniformation,
            data_level_3.candidatures_par_dates.date_de_recevabilite,
            data_level_2.recevabilite.certification_authority_name,
            CASE
                WHEN data_level_3.candidatures_par_dates.candidacy_id IS NOT NULL THEN data_level_3.candidatures_par_dates.date_envoi_dv
                WHEN jury_gip.candidacy_id IS NOT NULL THEN GREATEST(CAST(CAST(jury_gip.date_of_result AS DATE) - INTERVAL '30 days' AS DATE), CAST(data_level_3.candidatures_par_dates.date_de_recevabilite AS DATE))
                ELSE NULL
            END AS date_envoi_dv,
            data_level_3.candidatures_par_dates.date_envoi_dv AS date_envoi_dv_initiale,
            -- infos de jury
            jury_gip.date_of_exam,
            CASE
                WHEN jury_gip.candidacy_id IS NOT NULL THEN jury_gip.date_of_result
                ELSE NULL
            END AS date_of_result,
            jury_gip.result,
            jury_gip.result_simplified
        FROM candidacy_validees -- ne prendre que les IDs validés
        LEFT JOIN candidacy_status
            ON candidacy_status.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN data_level_2.drop_outs
            ON data_level_2.drop_outs.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN data_level_2.recevabilite 
            ON data_level_2.recevabilite.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN data_level_3.candidatures_par_dates
            ON data_level_3.candidatures_par_dates.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN candidatures_archivees
            ON candidatures_archivees.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN jury_gip
            ON jury_gip.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN dimensions_utiles
            ON dimensions_utiles.candidacy_id = candidacy_validees.candidacy_id
        LEFT JOIN data_level_2.cohorte_3095_uniformation
            ON data_level_2.cohorte_3095_uniformation.candidacy_id = dimensions_utiles.candidacy_id
        WHERE data_level_2.recevabilite.is_active = 'true'
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
    ), candidatures_projet AS (
        SELECT 
            projets.candidacy_id, 
            projets.current_status,
            created_at_current_status,
            false::text AS is_archive, 
            ''::text AS is_recevable, 
            false::text AS is_abandon, 
            NULL::date AS date_abandon, 
            ''::text AS drop_out_reason, 
            ''::text AS drop_out_status, 
            false::text AS is_demande_financement_envoyée,
            false::text AS is_demande_paiement_envoyée,
            ''::text AS num_action,
            ''::text AS invoice_number,
            '0_PROJET' AS macro_status, 
            '5_Hors_financement' AS cohorte,
            date_creation_candidature,
            NULL::date AS date_soumission, 
            NULL::date AS date_prise_en_charge, 
            NULL::date AS date_premier_rendez_vous,
            NULL::date AS date_df_envoye,
            NULL::date AS date_df_envoye_initiale,
            NULL::date AS date_envoi_demande_financement, 
            NULL::date AS date_de_recevabilite, 
            NULL::date AS date_envoi_dv, 
            NULL::date AS date_envoi_dv_initiale, 
            NULL::date AS date_of_exam,
            NULL::date AS date_of_result, 
            NULL::date date_envoi_demande_paiement,
            ''::text AS result,
            ''::text AS result_simplified, 
            dimensions_utiles.candidate_id,
            ''::text AS email,
            dimensions_utiles.organism_id, 
            dimensions_utiles.department_id, 
            dimensions_utiles.ccn_id, 
            dimensions_utiles.certification_id, 
            dimensions_utiles.certification_label, 
            dimensions_utiles.certificateur_id, 
            dimensions_utiles. certification_rncp_id, 
            dimensions_utiles. certificateur_label, 
            dimensions_utiles. certificateur_name, 
            ''::text as certification_authority_name,
            ''::text AS feasibility_format,
            dimensions_utiles.typology, 
            dimensions_utiles.appointment_count, 
            dimensions_utiles.first_appointment_occured_at, 
            dimensions_utiles.finance_module::text, 
            dimensions_utiles.type_accompagnement::text
        FROM projets
        LEFT JOIN dimensions_utiles
            ON dimensions_utiles.candidacy_id = projets.candidacy_id
    )
    SELECT
        ranked.candidacy_id,
        ranked.current_status,
        created_at_current_status,
        is_archive::text,
        is_recevable::text,
        is_abandon::text,
        -- Infos d'abandons
        date_abandon,
        drop_out_reason,
        drop_out_status,
        is_demande_financement_envoyée::text,
        is_demande_paiement_envoyée::text,
        num_action,
        invoice_number,
        -- Infos de classifications
        CASE
            WHEN is_abandon IS true and date_prise_en_charge IS NULL THEN 'Z_ABANDON_AVANT_PRISE_EN_CHARGE'
            WHEN is_abandon IS true and date_df_envoye IS NULL THEN 'Z_ABANDON_AVANT_ENVOI_DF'
            WHEN is_abandon IS true and date_de_recevabilite IS NULL THEN 'Z_ABANDON_AVANT_RECEPTION_RECEVABILITE'
            WHEN is_recevable is false THEN 'Z_NON_RECEVABLE'
            WHEN is_abandon IS true and is_recevable IS true AND date_envoi_dv IS NULL THEN 'Z_ABANDON_EN_REDACTION'
            WHEN is_abandon IS true and date_envoi_dv IS NOT NULL AND date_of_exam IS NULL THEN 'Z_ABANDON_ATTENTE_DATE_JURY'
            WHEN is_abandon IS true and date_of_exam IS NOT NULL AND date_of_result IS NULL THEN 'Z_ABANDON_ATTENTE_RESULTAT'
            WHEN date_of_result IS NOT NULL THEN '8_RESULTAT_OBTENU'
            WHEN is_archive IS true THEN 'Z_ARCHIVE'
            WHEN date_of_exam <= CURRENT_DATE AND date_envoi_dv IS NOT NULL THEN '7_ATTENTE_RESULTAT'
            WHEN date_of_exam > CURRENT_DATE AND date_envoi_dv IS NOT NULL THEN '6_ATTENTE_JURY_AVEC_DATE_A_VENIR'
            WHEN date_envoi_dv IS NOT NULL AND date_of_exam IS NULL THEN '5_ATTENTE_JURY_SANS_DATE'
            WHEN is_recevable is true THEN '4_EN_REDACTION'
            WHEN date_df_envoye IS NOT NULL THEN '3_ATTENTE_RECEVABILITE'
            WHEN date_prise_en_charge IS NOT NULL AND dimensions_utiles.type_accompagnement = 'ACCOMPAGNE' THEN '2_PRISE_EN_CHARGE'
            WHEN date_soumission IS NOT NULL AND dimensions_utiles.type_accompagnement = 'ACCOMPAGNE' THEN '1_SOUMISE'
            WHEN ranked.current_status = 'PROJET' THEN '0_PROJET'
            ELSE CAST(ranked.current_status AS text)
        END AS macro_status,
        CASE 
            WHEN -- Dont le num action fait partie des 3095
                cohorte_uniformation = '3095_uniformation' then 'Z_3095_uniformation' 
            WHEN -- archivées
                is_archive is true THEN 'Z_Archive' -- Archives 
            WHEN -- Soumises avant le 19/12/23
                date_soumission < '2023-12-19'
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                THEN '1_Pré_19/12/23' 
            WHEN -- Soumises entre décembre et juin, avec rdv pris avant et demande de financement envoyée avant le 12/06
                date_soumission >= '2023-12-19' AND date_soumission < '2024-06-13' 
                AND date_premier_rendez_vous < '2024-06-12' 
                AND date_envoi_demande_financement < '2024-06-12'
                AND is_archive is false 
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                THEN '2_Demande_financement_avant_12/06'
            WHEN -- Soumises entre décembre et juin, avec rdv pris avant et demande de financement envoyée après le 12/06 ou non envoyée
                date_soumission >= '2023-12-19' AND date_soumission < '2024-06-13' 
                AND date_premier_rendez_vous < '2024-06-12' 
                AND (date_envoi_demande_financement >= '2024-06-12' OR date_envoi_demande_financement IS NULL)
                AND is_archive is false 
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                AND certification_rncp_id IN (
                    '36805', '37795', '34691', '37780', '34690', '37792', '34692', '35830', 
                    '35832', '492', '4503', '34826', '35028', '37676', '34825', '37679', 
                    '34827', '36004', '36938', '37231', '12296', '12301', '36836', '37274', 
                    '37715', '35506', '35993', '35513', '37675', '34824', '38565', '28048', 
                    '38390', '25085', '36788', '13905', '39643')
                THEN '3a_Convention_20000_stock_restant_avant_12/06'
            WHEN -- Soumises entre décembre et octobre, avec rdv pris avant le 25/10 et demande de financement envoyée après le 12/06 ou non encore envoyée 
                date_soumission >= '2023-12-19' AND date_soumission < '2024-10-26' 
                AND date_premier_rendez_vous >= '2024-06-12' AND date_premier_rendez_vous < '2024-10-26'
                AND (date_envoi_demande_financement >= '2024-06-12' OR date_envoi_demande_financement IS NULL)
                AND is_archive is false 
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                AND certification_rncp_id IN (
                    '36805', '37795', '34691', '37780', '34690', '37792', '34692', '35830', 
                    '35832', '492', '4503', '34826', '35028', '37676', '34825', '37679', 
                    '34827', '36004', '36938', '37231', '12296', '12301', '36836', '37274', 
                    '37715', '35506', '35993', '35513', '37675', '34824', '38565', '28048', 
                    '38390', '25085', '36788', '13905', '39643')
                THEN '3b_Convention_20000_stock_réouverture_avant_25/10'
            WHEN -- Soumises entre décembre et octobre, avec rdv pris et demande de financement envoyée après le 12/06 ou non encore envoyée 
                date_soumission >= '2023-12-19' AND date_soumission < '2024-10-26' 
                AND date_premier_rendez_vous >= '2024-10-26'
                AND (date_envoi_demande_financement >= '2024-06-12' OR date_envoi_demande_financement IS NULL)
                AND is_archive is false
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                AND certification_rncp_id IN (
                    '36805', '37795', '34691', '37780', '34690', '37792', '34692', '35830', 
                    '35832', '492', '4503', '34826', '35028', '37676', '34825', '37679', 
                    '34827', '36004', '36938', '37231', '12296', '12301', '36836', '37274', 
                    '37715', '35506', '35993', '35513', '37675', '34824', '38565', '28048', 
                    '38390', '25085', '36788', '13905', '39643')
                THEN '3c_Convention_20000_stock_réouverture_après_25/10'
            WHEN -- soumises avant le 25 octobre mais sans RDV
                date_soumission >= '2023-12-19' AND date_soumission < '2024-10-26' 
                AND date_premier_rendez_vous IS NULL
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                AND dimensions_utiles.type_accompagnement = 'ACCOMPAGNE'
                THEN '4_Soumise_avant_25/10/24_sans_rdv_a_date_unifvae'
            WHEN -- HORS CARE
                date_soumission >= '2023-12-19' AND date_soumission < '2024-10-26' 
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                AND dimensions_utiles.finance_module = 'unifvae'
                AND certification_rncp_id NOT IN (
                    '36805', '37795', '34691', '37780', '34690', '37792', '34692', '35830', 
                    '35832', '492', '4503', '34826', '35028', '37676', '34825', '37679', 
                    '34827', '36004', '36938', '37231', '12296', '12301', '36836', '37274', 
                    '37715', '35506', '35993', '35513', '37675', '34824', '38565', '28048', 
                    '38390', '25085', '36788', '13905', '39643')
                THEN 'Z_Hors_Care_Pré_12/06'
            WHEN -- Soumises après le 25/10 ou basculées en hors financement
                (dimensions_utiles.finance_module = 'hors_plateforme' OR dimensions_utiles.type_accompagnement = 'AUTONOME')
                AND ((is_abandon is true AND date_df_envoye IS NOT NULL) OR is_abandon is false)
                THEN '5_Hors_financement'
            WHEN -- Abandons
                is_abandon is true AND date_df_envoye IS NULL
                THEN 'Z_Abandons_avant_envoi_dossier_faisabilite'
            ELSE 'Z_A_définir' 
        END AS cohorte,
        -- structuration des dates clefs
        dimensions_utiles.date_creation_candidature,
        date_soumission,
        date_prise_en_charge,
        date_premier_rendez_vous,
        date_df_envoye,
        date_df_envoye_initiale,
        date_envoi_demande_financement,
        date_de_recevabilite, -- vérifier que c'est bien cette date que l'on prend pour la recevabilité
        date_envoi_dv,
        date_envoi_dv_initiale,
        -- infos de jury
        date_of_exam,
        date_of_result,
        date_envoi_demande_paiement,
        result,
        result_simplified,
        -- infos de candidature
        dimensions_utiles.candidate_id,
        dimensions_utiles.email,
        dimensions_utiles.organism_id,
        dimensions_utiles.department_id,
        dimensions_utiles.ccn_id,
        dimensions_utiles.certification_id,
        dimensions_utiles.certification_label,
        dimensions_utiles.certificateur_id,
        dimensions_utiles.certification_rncp_id,
        dimensions_utiles.certificateur_label,
        dimensions_utiles.certificateur_name,
        data_level_2.recevabilite.certification_authority_name,
        dimensions_utiles.feasibility_format,
        dimensions_utiles.typology,
        dimensions_utiles.appointment_count,
        dimensions_utiles.first_appointment_occured_at,
        dimensions_utiles.finance_module,
        dimensions_utiles.type_accompagnement
    FROM
    (
        SELECT
            candidacy_id,
            current_status::text,
            created_at_current_status,
            is_archive,
            is_recevable,
            is_abandon,
            CASE
                WHEN date_envoi_demande_financement IS NULL THEN false
                ELSE true
            END AS is_demande_financement_envoyée,
            CASE
                WHEN date_envoi_demande_paiement IS NULL THEN false
                ELSE true
            END AS is_demande_paiement_envoyée,
            date_abandon,
            drop_out_reason,
            drop_out_status,
            -- structuration des dates clefs
            date_soumission,
            date_prise_en_charge,
            date_premier_rendez_vous,
            date_df_envoye,
            date_df_envoye_initiale,
            date_envoi_demande_financement,
            num_action,
            invoice_number,
            cohorte_uniformation,
            date_de_recevabilite, -- vérifier que c'est bien cette date que l'on prend pour la recevabilité
            certification_authority_name,
            date_envoi_dv,
            date_envoi_dv_initiale,
            -- infos de jury
            date_of_exam,
            date_of_result,
            date_envoi_demande_paiement,
            result,
            result_simplified
        FROM candidacy_data
    ) AS ranked
    LEFT JOIN dimensions_utiles
        ON dimensions_utiles.candidacy_id = ranked.candidacy_id
    LEFT JOIN data_level_2.recevabilite 
        ON data_level_2.recevabilite.candidacy_id = ranked.candidacy_id
    WHERE data_level_2.recevabilite.is_active = 'true'
    UNION 
        SELECT * FROM candidatures_projet
); 

-- creation de la table visualisation pour faire le funnel 

CREATE TABLE "data_level_3"."modele_visualisation_funnel" AS 
(
        WITH viz_count_soumission AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '1_soumise' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_AVANT_ENVOI_DF' AND date_prise_en_charge IS NULL THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status = '1_SOUMISE' THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN macro_status != '1_SOUMISE' AND NOT(macro_status = 'Z_ABANDON_AVANT_ENVOI_DF' AND date_prise_en_charge IS NULL) THEN 1
            ELSE 0
        END AS count_suivant,
        0 AS count_non_recevable, 
        0 AS count_en_cours_avec_date,
        CASE 
            WHEN macro_status = 'Z_ABANDON_AVANT_ENVOI_DF' AND date_prise_en_charge IS NULL THEN date_abandon - date_soumission
            WHEN macro_status NOT IN ('Z_ABANDON_AVANT_ENVOI_DF', '1_CANDIDATURE_SOUMISE') AND date_prise_en_charge IS NOT NULL THEN date_prise_en_charge - date_soumission
            WHEN macro_status = '1_SOUMISE' THEN now() - date_soumission
        end as délai, 
        CASE 
            WHEN macro_status NOT IN ('Z_ABANDON_AVANT_ENVOI_DF', '1_SOUMISE') AND date_prise_en_charge IS NOT NULL
                AND extract(epoch from (date_prise_en_charge - date_soumission)/ 86400)::float >= 2 THEN true 
            WHEN macro_status = '1_SOUMISE' AND extract(epoch from (now() - date_soumission) / 86400)::float >= 2 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND date_soumission IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ), viz_count_prise_en_charge AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '2_prise_en_charge' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_AVANT_ENVOI_DF' AND date_prise_en_charge IS NOT NULL THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status = '2_PRISE_EN_CHARGE' THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN macro_status NOT IN ('Z_ABANDON_AVANT_ENVOI_DF', '2_PRISE_EN_CHARGE') THEN 1
            ELSE 0
        END AS count_suivant,
        0 AS count_non_recevable, 
        0 AS count_en_cours_avec_date,
        CASE 
            WHEN macro_status NOT IN ('Z_ABANDON_AVANT_ENVOI_DF', '2_PRISE_EN_CHARGE') THEN date_DF_envoye - date_prise_en_charge
            WHEN macro_status = 'Z_ABANDON_AVANT_ENVOI_DF' THEN date_abandon - date_prise_en_charge
            WHEN macro_status = '2_PRISE_EN_CHARGE' then now() - date_prise_en_charge
        END AS délai, 
        CASE 
            WHEN macro_status NOT IN ('Z_ABANDON_AVANT_ENVOI_DF', '2_PRISE_EN_CHARGE') AND extract(epoch from (date_DF_envoye - date_prise_en_charge)/ 86400)::float >= 30 THEN true 
            WHEN macro_status = '2_PRISE_EN_CHARGE' AND extract(epoch from (now() - date_prise_en_charge) / 86400)::float >= 30 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND date_prise_en_charge IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ), viz_count_attente_recevabilite AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '3_recevabilite' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_AVANT_RECEPTION_RECEVABILITE' THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status = '3_ATTENTE_RECEVABILITE' THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN is_recevable = 'true' THEN 1
            ELSE 0
        END AS count_suivant,
        CASE
            WHEN macro_status = 'Z_NON_RECEVABLE' THEN 1
            ELSE 0
        END AS count_non_recevable, 
        0 AS count_en_cours_avec_date,
        CASE 
            WHEN is_recevable = 'true' OR macro_status = 'Z_NON_RECEVABLE' THEN date_de_recevabilite - date_DF_envoye
            WHEN macro_status = 'Z_ABANDON_AVANT_RECEPTION_RECEVABILITE' THEN date_abandon - date_DF_envoye
            WHEN macro_status = '3_ATTENTE_RECEVABILITE' THEN now() - date_DF_envoye
        END AS délai, 
        CASE 
            WHEN is_recevable = 'true' OR macro_status = 'Z_NON_RECEVABLE' AND extract(epoch from (date_de_recevabilite - date_DF_envoye)/ 86400)::float >= 15 THEN true 
            WHEN macro_status = '3_ATTENTE_RECEVABILITE' AND extract(epoch from (now() - date_DF_envoye) / 86400)::float >= 15 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND date_DF_envoye IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ), viz_count_en_redaction AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '4_en_ecriture' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_EN_REDACTION' THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status = '4_EN_REDACTION' THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN date_envoi_dv IS NOT NULL THEN 1
            ELSE 0
        END AS count_suivant,
        0 AS count_non_recevable,
        0 AS count_en_cours_avec_date,
        CASE 
            WHEN date_envoi_dv IS NOT NULL THEN date_envoi_dv - date_de_recevabilite
            WHEN macro_status = 'Z_ABANDON_EN_REDACTION' THEN date_abandon - date_de_recevabilite
            WHEN macro_status = '4_EN_REDACTION' THEN now() - date_de_recevabilite
        END AS délai, 
        CASE 
            WHEN date_of_exam IS NOT NULL AND extract(epoch from (date_envoi_dv - date_de_recevabilite)/ 86400)::float >= 180 THEN true 
            WHEN macro_status = '4_EN_REDACTION' AND extract(epoch from (now() - date_envoi_dv) / 86400)::float >= 180 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND is_recevable = 'true'
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ), viz_count_attente_date_jury AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '5_en_attente_jury' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_ATTENTE_DATE_JURY' THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status in ('5_ATTENTE_JURY_SANS_DATE') THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN date_of_exam IS NOT NULL AND macro_status NOT IN ('6_ATTENTE_JURY_AVEC_DATE_A_VENIR') THEN 1
            ELSE 0
        END AS count_suivant,
        0 AS count_non_recevable, 
        CASE
            WHEN macro_status in ('6_ATTENTE_JURY_AVEC_DATE_A_VENIR') THEN 1
            ELSE 0
        END AS count_en_cours_avec_date,
        CASE 
            WHEN date_of_exam IS NOT NULL THEN date_of_exam - date_envoi_dv
            WHEN macro_status = 'Z_ABANDON_ATTENTE_DATE_JURY' THEN date_abandon - date_envoi_dv
            WHEN macro_status in ('5_ATTENTE_JURY_SANS_DATE') THEN now() - date_envoi_dv
        END AS délai, 
        CASE 
            WHEN date_of_exam IS NOT NULL AND extract(epoch from (date_of_exam - date_envoi_dv)/ 86400)::float >= 90 THEN true 
            WHEN macro_status = '5_ATTENTE_JURY_SANS_DATE' AND extract(epoch from (now() - date_envoi_dv) / 86400)::float >= 90 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND is_recevable = 'true' AND date_envoi_dv IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ), viz_count_attente_resultats AS
    (
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format,
        typology,
        type_accompagnement,
        macro_status,
        '6_résultats' AS funnel_status,
        CASE
            WHEN macro_status = 'Z_ABANDON_ATTENTE_RESULTAT' THEN 1
            ELSE 0
        END AS count_abandon,
        CASE
            WHEN macro_status = '7_ATTENTE_RESULTAT' OR result_simplified IN ('ABSENCE') THEN 1
            ELSE 0
        END AS count_en_cours,
        CASE
            WHEN macro_status = '8_RESULTAT_OBTENU' AND result_simplified NOT IN ('ABSENCE') THEN 1
            ELSE 0
        END AS count_suivant,
        0 AS count_non_recevable, 
        0 AS count_en_cours_avec_date,
        CASE 
            WHEN macro_status = 'Z_ABANDON_ATTENTE_RESULTAT' THEN date_abandon - date_of_exam
            WHEN date_of_result IS NOT NULL THEN date_of_result - date_of_exam
            WHEN macro_status = '7_ATTENTE_RESULTAT' THEN now() - date_of_exam
        END AS délai, 
        CASE 
            WHEN date_of_result IS NOT NULL AND extract(epoch from (date_of_result - date_of_exam)/ 86400)::float >= 15 THEN true 
            WHEN macro_status = '7_ATTENTE_RESULTAT' AND extract(epoch from (now() - date_of_exam) / 86400)::float >= 15 THEN true 
            ELSE false 
        END AS en_retard
    FROM "data_level_3"."modele_candidatures"
    WHERE is_archive = 'false' AND is_recevable = 'true' AND date_of_exam IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    )
    SELECT
        candidacy_id,
        date_soumission,
        date_prise_en_charge,
        cohorte,
        organism_id,
        ccn_id,
        certification_label,
        certificateur_name,
        feasibility_format::text,
        typology,
        type_accompagnement,
        macro_status,
        funnel_status,
        en_retard,
        SUM(count_abandon) AS count_abandon,
        SUM(count_en_cours) AS count_en_cours,
        SUM(count_suivant) AS count_suivant,
        SUM(count_non_recevable) AS count_non_recevable, 
        SUM(count_en_cours_avec_date) AS count_en_cours_avec_date, 
        CASE 
            WHEN avg(extract (epoch from délai) / 86400)::float IS NOT NULL THEN avg(extract (epoch from délai) / 86400)::float
            ELSE 0
        END AS délai
    FROM
    (
    (SELECT * FROM viz_count_soumission)
    UNION ALL
    (SELECT * FROM viz_count_prise_en_charge)
    UNION ALL
    (SELECT * FROM viz_count_attente_recevabilite)
    UNION ALL
    (SELECT * FROM viz_count_en_redaction)
    UNION ALL
    (SELECT * FROM viz_count_attente_date_jury)
    UNION ALL
    (SELECT * FROM viz_count_attente_resultats)
    ) AS unioned 
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
);


