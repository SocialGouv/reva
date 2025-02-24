-- This is an empty migration
update FEATURES
set
    KEY = 'USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS',
    label = 'Utiliser les templates définis dans Brevo pour les emails destinés au candidats'
where
    KEY = 'USE_BREVO_EMAIL_TEMPLATES';