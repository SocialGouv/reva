delete from candidacy_candidacy_status
where
    status = 'DEMANDE_FINANCEMENT_ENVOYE'
    or status = 'DEMANDE_PAIEMENT_ENVOYEE';