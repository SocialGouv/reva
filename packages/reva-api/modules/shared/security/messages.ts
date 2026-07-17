// Messages de refus d'autorisation, partagés par les middlewares, les features et les tests.
// User-facing : l'admin les affiche bruts dans un toast (graphqlErrorToast).
// Modifier un libellé ici est un changement visible en production.

export const NOT_AUTHORIZED = "Utilisateur non autorisé";

export const SESSION_EXPIRED =
  "Votre session a expiré, veuillez vous reconnecter.";

export const NOT_AUTHORIZED_CANDIDACY_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cette candidature";

export const NOT_AUTHORIZED_CANDIDACY_MANAGE =
  "Vous n'êtes pas autorisé à gérer cette candidature.";

export const NOT_AUTHORIZED_RESOURCE_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cette ressource";

export const NOT_AUTHORIZED_ORGANISM_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cet organisme";

export const NOT_AUTHORIZED_MAISON_MERE_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cette maison mère";

export const NOT_AUTHORIZED_STRUCTURE_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cette structure";

export const NOT_AUTHORIZED_LOCAL_ACCOUNT_ACCESS =
  "Vous n'êtes pas autorisé à consulter ce compte collaborateur.";

export const NOT_AUTHORIZED_ACCOUNT_ACCESS =
  "Vous n'êtes pas autorisé à accéder à ce compte";

export const NOT_AUTHORIZED_CERTIFICATION_ACCESS =
  "Vous n'êtes pas autorisé à accéder à cette certification";

export const NOT_AUTHORIZED_CERTIFICATION_AUTHORITY_ACCESS =
  "Vous n'êtes pas autorisé à consulter cette autorité de certification.";

export const NOT_AUTHORIZED_DOSSIER_ACCESS =
  "Vous n'êtes pas autorisé à consulter ce dossier";

export const NOT_AUTHORIZED_FILE_ACCESS =
  "Vous n'êtes pas autorisé à accéder à ce fichier.";

export const NOT_AUTHORIZED_FILE_VIEW =
  "Vous n'êtes pas autorisé à visualiser ce fichier.";
