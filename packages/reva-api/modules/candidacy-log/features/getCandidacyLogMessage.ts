import { format } from "date-fns";

import { CandidacyLog } from "../candidacy-log.types";

type LogMessage = {
  message: string;
  details?: string;
};

function log(message: string, details?: string): LogMessage {
  return { message, details };
}

export const getCandidacyLogMessage = ({
  candidacyLog,
}: {
  candidacyLog: CandidacyLog;
}): LogMessage => {
  const { eventType, details } = candidacyLog;

  switch (eventType) {
    case "CANDIDATE_CONTACT_INFORMATION_UPDATED":
      return log("Informations de contact du candidat modifiées");

    case "CANDIDATE_CIVIL_INFORMATION_UPDATED":
      return log("Informations civiles du candidat modifiées");

    case "CANDIDATE_UPDATED":
      return log("Informations du compte candidat modifiées");

    case "CANDIDATE_REGISTRATION_CONFIRMED":
      return log("Compte candidat créé");

    case "CANDIDATE_PROFILE_UPDATED":
      return log("Profil du candidat modifié");

    case "DOSSIER_DE_VALIDATION_SENT":
      return log("Dossier de validation envoyé");

    case "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED":
      return log("Dossier de validation signalé");

    case "DOSSIER_DE_VALIDATION_VERIFIED":
      return log("Dossier de validation vérifié");

    case "CANDIDACY_SUBMITTED":
      return log("Candidature envoyée");

    case "CERTIFICATION_UPDATED":
      return details
        ? log(
            "Certification choisie",
            `${details.certification.label} (${details.certification.codeRncp})`,
          )
        : log("Certification choisie");

    case "EXPERIENCE_ADDED":
      return log("Expérience ajoutée");

    case "EXPERIENCE_UPDATED":
      return log("Expérience modifiée");

    case "GOALS_UPDATED":
      return log("Objectifs saisis");

    case "CONTACT_INFO_UPDATED":
      return log("Informations de contact modifiées");

    case "CANDIDACY_DELETED":
      return log("Candidature supprimée");

    case "CANDIDACY_ARCHIVED":
      return details?.label
        ? log("Candidature archivée", details.label)
        : log("Candidature archivée");

    case "CANDIDACY_UNARCHIVED":
      return log("Candidature désarchivée");

    case "APPOINTMENT_INFO_UPDATED":
      return log(
        "Date du premier rendez-vous pédagogique saisie",
        format(details.firstAppointmentOccuredAt, "dd/MM/yyyy"),
      );

    case "CANDIDACY_TAKEN_OVER":
      return log("Candidature prise en charge");

    case "ORGANISM_SELECTED":
      return details
        ? log("Organisme d'accompagnement sélectionné", details.organism.label)
        : log("Organisme d'accompagnement sélectionné");

    case "TYPOLOGY_AND_CCN_INFO_UPDATED":
      return log(
        "Informations de typologie et de convention collective modifiées",
        `${details.typology} ${
          details.ccn ? `— ${details.ccn.label}, n°${details.ccn.idcc}` : ""
        }`.trim(),
      );

    case "TRAINING_INFO_RESET":
      return log("Parcours candidat réinitialisé");

    case "TRAINING_FORM_SUBMITTED":
      return log("Parcours candidat envoyé");

    case "TRAINING_FORM_CONFIRMED":
      return log("Parcours candidat confirmé");

    case "CANDIDACY_DROPPED_OUT":
      return log("Candidature abandonnée");

    case "CANDIDACY_DROP_OUT_VALIDATED":
      return log("Validation de l'abandon de la candidature");

    case "CANDIDACY_DROP_OUT_CANCELED":
      return log("Annulation de l'abandon de la candidature");

    case "READY_FOR_JURY_ESTIMATED_DATE_UPDATED":
      return log(
        "Date prévisionnelle du dossier de validation saisie",
        format(details.readyForJuryEstimatedAt, "dd/MM/yyyy"),
      );

    case "FEASIBILITY_SENT":
      return log(
        "Dossier de recevabilité envoyé",
        details?.certificationAuthorityLabel
          ? `certificateur ${details.certificationAuthorityLabel}`
          : "",
      );

    case "FEASIBILITY_MARKED_AS_COMPLETE":
      return log("Dossier de recevabilité complet");

    case "FEASIBILITY_MARKED_AS_INCOMPLETE":
      return log("Dossier de recevabilité marqué incomplet");

    case "FEASIBILITY_REJECTED":
      return log("Dossier de recevabilité rejeté");

    case "FEASIBILITY_VALIDATED":
      return log("Dossier de recevabilité validé");

    case "FUNDING_REQUEST_CREATED":
      return log("Demande de financement envoyée");

    case "PAYMENT_REQUEST_CREATED_OR_UPDATED":
      return log("Demande de paiement créée ou modifiée");

    case "PAYMENT_REQUEST_CONFIRMED":
      return log("Demande de paiement confirmée");

    case "JURY_EXAM_INFO_UPDATED":
      return log(
        "Informations jury modifiées",
        `${details.examResult}, ${
          details.estimatedExamDate
            ? `estimée le ${format(details.estimatedExamDate, "dd/MM/yyyy")},`
            : ""
        } ${
          details.actualExamDate
            ? `prévue le ${format(details.actualExamDate, "dd/MM/yyyy")}`
            : ""
        }`.trim(),
      );

    case "JURY_RESULT_UPDATED":
      return log("Résultat du jury saisi", details.result);

    case "JURY_SESSION_SCHEDULED":
      return log(
        "Date de passage en jury attribuée au candidat",
        `le ${format(details.dateOfSession, "dd/MM/yyyy")} ${
          details.timeOfSession ? `à ${details.timeOfSession}` : ""
        }`.trim(),
      );

    case "TYPE_ACCOMPAGNEMENT_UPDATED":
      return log(
        "Type d'accompagnement modifié",
        `nouveau type d'accompagnement: ${details.typeAccompagnement}${details.reason ? `, raison: ${details.reason || ""}` : ""}`,
      );

    case "CANDIDACY_ACTUALISATION":
      return log("Candidature actualisée");

    case "CADUCITE_CONTESTED":
    case "CADUCITE_INVALIDATED":
      return log("Caducité de la candidature invalidée");

    case "CADUCITE_CONFIRMED":
      return log("Caducité de la candidature confirmée");

    case "DFF_SENT_TO_CANDIDATE":
      return log(
        "Demande de validation du dossier de recevabilité envoyée au candidat",
      );

    case "DFF_VALIDATED_BY_CANDIDATE":
      return log("Dossier de recevabilité validé");

    case "DFF_SENT_TO_CERTIFICATION_AUTHORITY":
      return log(
        "Dossier de recevabilité envoyé au certificateur",
        details?.certificationAuthorityLabel
          ? `certificateur ${details.certificationAuthorityLabel}`
          : "",
      );

    case "CANDIDACY_DROPOUT_CONFIRMED_BY_CANDIDATE":
      return log("Abandon de la candidature confirmé");

    case "CANDIDACY_DROPOUT_CANCELED_BY_CANDIDATE":
      return log("Annulation de l'abandon de la candidature");

    case "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_CONFIRMED":
      return log("Caducité de la candidature confirmée");

    case "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_INVALIDATED":
      return log("Caducité de la candidature invalidée");

    case "FINANCE_MODULE_UPDATED":
      return log(
        "Module de financement mis à jour.",
        `nouveau module:${details.financeModule}${details.reason ? `, raison: ${details.reason || ""}` : ""}`,
      );

    case "CANDIDATE_CONTACT_DETAILS_UPDATED":
      return log(
        "Coordonnées du candidat modifiées",
        `téléphone: ${details.phone}, ${details.email ? `, email: ${details.email || ""}` : ""}`,
      );

    case "CANDIDACY_TRANSFERRED_TO_CERTIFICATION_AUTHORITY":
      return log(
        "Candidature transférée à un autre gestionnaire de candidature",
        `certificateur: ${details.certificationAuthorityLabel}${details.certificationAuthorityTransferReason ? `, raison: ${details.certificationAuthorityTransferReason}` : ""}`,
      );

    case "CANDIDACY_TRANSFERRED_TO_CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT":
      return log(
        "Candidature transférée à un autre compte certificateur local",
        `email du compte local: ${details.certificationAuthorityLocalAccountAccountEmail}${details.certificationAuthorityTransferReason ? `, raison: ${details.certificationAuthorityTransferReason}` : ""}`,
      );

    case "ADMIN_CUSTOM_ACTION":
      return details?.message
        ? log("Action exceptionnelle effectuée", details.message)
        : log("Action exceptionnelle effectuée");

    case "JURY_DECISION_REVOKED":
      return details?.reason
        ? log("Décision du jury révoquée", details.reason)
        : log("Décision du jury révoquée");

    case "FEASIBILITY_DECISION_REVOKED":
      return details?.reason
        ? log("Décision de recevabilité révoquée", details.reason)
        : log("Décision de recevabilité révoquée");

    case "END_ACCOMPAGNEMENT_SUBMITTED":
      return log(
        "Date de fin d'accompagnement déclarée",
        format(details.endAccompagnementDate, "dd/MM/yyyy"),
      );

    case "CANDIDATE_REFUSED_END_ACCOMPAGNEMENT":
      return log("Fin d'accompagnement refusée");

    case "CANDIDATE_CONFIRMED_END_ACCOMPAGNEMENT":
      return log("Fin d'accompagnement confirmée");

    case "SWORN_STATEMENT_UPDATED":
      return log("Attestation sur l'honneur envoyée");

    case "FEASIBILITY_FILE_TEMPLATE_FIRST_READ_AT_UPDATED":
      return log(
        "Date de première lecture du modèle de dossier de recevabilité ",
        format(details.feasibilityFileTemplateFirstReadAt, "dd/MM/yyyy"),
      );

    default:
      return log("Événement inconnu");
  }
};
