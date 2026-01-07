import { AAPLog } from "../aap-log.types";

type LogMessage = {
  message: string;
  details?: string;
};

function log(message: string, details?: string): LogMessage {
  return { message, details };
}

export const getAAPLogMessage = ({
  aapLog,
}: {
  aapLog: AAPLog;
}): LogMessage => {
  const { eventType, details } = aapLog;

  switch (eventType) {
    case "SUBCRIBTION_REQUEST_VALIDATED":
      return log("Demande de création de compte validée");

    case "MAISON_MERE_LEGAL_INFORMATION_UPDATED":
      return log("Informations générales de la maison mère mises à jour");

    case "MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED":
      return log(
        "Statut de la maison mère mis à jour",
        `nouveau statut :  ${details.isActive ? "activé" : "désactivé"}`,
      );
    case "MAISON_MERE_SIGNALIZED_STATUS_UPDATED":
      return log(
        "Signalisation de la maison mère mis à jour",
        `nouveau statut :  ${details.isSignalized ? "signalée" : "non signalée"}`,
      );
    case "MAISON_MERE_FINANCING_METHODS_UPDATED":
      return log(
        "Modalités de financement de la maison mère mises à jour",
        `${details.isMCFCompatible ? "référencée MCF" : "non référencée MCF"}`,
      );
    case "ORGANISM_SEARCH_RESULTS_VISIBILITY_UPDATED":
      return log(
        "Visibilité d'un organisme mise à jour",
        `nom: ${details.organismLabel}, modalité d'accompagnement: ${details.modaliteAccompagnement}, visibilité: ${
          details.visibleInSearchResults ? "visible" : "invisible"
        }`,
      );
    case "ORGANISM_REMOTE_GENERAL_INFORMATION_UPDATED":
      return log(
        "Informations générales de l'accompagnement à distance mises à jour",
      );
    case "ORGANISM_ONSITE_GENERAL_INFORMATION_UPDATED":
      return log(
        "Informations générales du lieu d'acceuil mises à jour",
        `nom: ${details.organismLabel}`,
      );
    case "ORGANISM_DEGREES_AND_FORMACODES_UPDATED":
      return log(
        "Domaines, branches et niveaux de l'organisme mis à jour",
        `nom: ${details.organismLabel}, modalité d'accompagnement: ${details.modaliteAccompagnement}`,
      );
    case "LIEU_ACCUEIL_CREATED":
      return log("Lieu d'accueil créé", `nom: ${details.organismLabel}`);
    case "ORGANISM_ACCOUNT_CREATED":
      return log(
        "Compte collaborateur créé",
        `email: ${details.accountEmail}, organisme: ${details.organismLabel}`,
      );
    case "ORGANISM_ACCOUNT_CREATED_V2":
      return log(
        "Compte collaborateur créé",
        `email: ${details.accountEmail}, maison mère: ${details.maisonMereAAPRaisonSociale}`,
      );
    case "ORGANISM_ACCOUNT_UPDATED":
      return log(
        "Compte collaborateur mis à jour",
        `email: ${details.accountEmail}, organisme: ${details.organismLabel}`,
      );
    case "ORGANISM_ACCOUNT_UPDATED_V2":
      return log(
        "Compte collaborateur mis à jour",
        `email: ${details.accountEmail}, maison mère: ${details.maisonMereAAPRaisonSociale}`,
      );

    default:
      return log("Événement inconnu");
  }
};
