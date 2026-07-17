// Messages d'erreur métier partagés, dupliqués à l'identique sur plusieurs modules.
// User-facing : l'admin les affiche bruts dans un toast (graphqlErrorToast).
// Modifier un libellé ici est un changement visible en production.
// Les messages de refus d'autorisation vivent à part, dans shared/security/messages.ts.

export const CANDIDATURE_NON_TROUVEE = "Candidature non trouvée";

export const CANDIDAT_NON_TROUVE = "Candidat non trouvé";

export const DOSSIER_FAISABILITE_DEMATERIALISE_NON_TROUVE =
  "Dossier de faisabilité dématérialisé non trouvé";

export const CANDIDATURE_PAS_ETE_TROUVEE = "La candidature n'a pas été trouvée";

export const CERTIFICATION_PAS_ETE_TROUVEE =
  "La certification n'a pas été trouvée";

export const COMPTE_UTILISATEUR_NON_TROUVE = "Compte utilisateur non trouvé";

export const CERTIFICATION_NON_TROUVEE = "Certification non trouvée";

export const ORGANISME_NON_TROUVE = "Organisme non trouvé";

export const FICHIER_NON_TROUVE = "Fichier non trouvé";

export const DOSSIER_FAISABILITE_NON_TROUVE =
  "Dossier de faisabilité non trouvé";

export const COMPTE_NON_TROUVE = "Compte non trouvé";

export const AUCUNE_CANDIDATURE_ETE_TROUVEE =
  "Aucune candidature n'a été trouvée";

export const COMPTE_LOCAL_AUTORITE_CERTIFICATION_NON_TROUVE =
  "Compte local de l'autorité de certification non trouvé";

export const CANDIDATURE_PAS_ASSOCIEE_CERTIFICATION =
  "La candidature n'est pas associée à une certification";

export const CANDIDATURE_PAS_DOSSIER_FAISABILITE_COURS =
  "La candidature n'a pas de dossier de faisabilité en cours";

export const DOSSIER_FAISABILITE_PAS_RELIE_AUTORITE_CERTIFICATION =
  "Le dossier de faisabilité n'est pas relié à une autorité de certification";

export const DEMANDE_FINANCEMENT_NON_TROUVEE =
  "Demande de financement non trouvée";

export const ADRESSE_ELECTRONIQUE_OU_MOT_PASSE_INCORRECT =
  "Adresse électronique ou mot de passe incorrect";

export const IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER =
  "Impossible de modifier les expériences après l'envoi du dossier de faisabilité";

export const CANDIDAT_ASSOCIE_CANDIDATURE_PAS_RATTACHE_DEPARTEMENT =
  "Le candidat associé à la candidature n'est pas rattaché à un département";

export const DOSSIER_INTROUVABLE = "Ce dossier est introuvable";

export const COMPTE_LOCAL_AUTORITE_CERTIFICATION_NON_TROUVEE =
  "Compte local de l'autorité de certification non trouvée";

export const FAISABILITE_DEJA_ETE_PRONONCEE_DOSSIER =
  "La faisabilité a déjà été prononcée sur ce dossier";

export const DEMANDE_PAIEMENT_NON_TROUVEE = "Demande de paiement non trouvée";

export const ORGANISME_PAS_ETE_TROUVE = "L'organisme n'a pas été trouvé";

export const IDENTIFIANT_ORGANISME_VIDE = "Identifiant d'organisme vide";

export const STATUT_CERTIFICATION_NE_PERMET_PAS_MODIFIER =
  "Le statut de la certification ne permet pas de modifier les blocs de compétences";

export const DEMANDE_INSCRIPTION_NON_TROUVEE =
  "Demande d'inscription non trouvée";

export const COHORTE_NON_TROUVEE = "Cohorte non trouvée";

export const SESSION_VERIFICATION_EXPIREE_VEUILLEZ_VOUS_RECONNECTER =
  "Session de vérification expirée, veuillez vous reconnecter";

export const RENDEZ_VOUS_NON_TROUVE = "Rendez-vous non trouvé";

export const IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME =
  "Impossible de mettre à jour les experiences après avoir confirmé le parcours";

export const AUCUNE_EXPERIENCE_ETE_TROUVEE =
  "Aucune expérience n'a été trouvée";

export const CANDIDATE_NOT_FOUND = "Candidate not found";

export const AUTORITE_CERTIFICATION_NON_TROUVEE =
  "Autorité de certification non trouvée";

export const DOSSIER_VALIDATION_PAS_ETE_TROUVE =
  "Le dossier de validation n'a pas été trouvé";

export const CANDIDATURE_ETE_ABANDONNEE = "La candidature a été abandonnée";

export const CANDIDATURE_ETE_SUPPRIMEE = "La candidature a été supprimée";

export const DOSSIER_FAISABILITE_PAS_RECEVABLE =
  "Le dossier de faisabilité n'est pas recevable";

export const FAISABILITE_DEJA_ETE_MARQUEE_DOSSIER =
  "La faisabilité a déjà été marquée sur ce dossier";

export const DOSSIER_FAISABILITE_INTROUVABLE =
  "Dossier de faisabilité introuvable";

export const DATE_LIMITE_DEMANDE_PAIEMENT_DEPASSEE_CANDIDATURE =
  "La date limite de demande de paiement est dépassée pour cette candidature, comme spécifié dans la convention Uniformation";

export const CANDIDATURE_EXISTE_PAS = "La candidature n'existe pas";

export const RESULTAT_JURY_DEJA_ETE_RENSEIGNE =
  "Le résultat du jury a déjà été renseigné";

export const IDENTIFIANT_MAISON_MERE_OBLIGATOIRE =
  "L'identifiant de la maison mère est obligatoire";

export const MAISON_MERE_PAS_ETE_TROUVEE = "La maison mère n'a pas été trouvée";

export const STATUT_CERTIFICATION_DOIT_ETRE_ETAT_BROUILLON =
  "Le statut de la certification doit être à l'état 'Brouillon'";
