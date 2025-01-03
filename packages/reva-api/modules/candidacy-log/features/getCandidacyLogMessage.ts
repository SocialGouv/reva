import { format } from "date-fns";

import { CandidacyLog } from "../candidacy-log.types";

export const getCandidacyLogMessage = ({
  candidacyLog,
}: {
  candidacyLog: CandidacyLog;
}) => {
  const { eventType, details } = candidacyLog;

  switch (eventType) {
    case "CANDIDATE_CONTACT_INFORMATION_UPDATED":
      return "Informations de contact du candidat modifiées.";
    case "CANDIDATE_CIVIL_INFORMATION_UPDATED":
      return "Informations civiles du candidat modifiées.";
    case "CANDIDATE_UPDATED":
      return "Informations du compte candidat modifiées.";
    case "CANDIDATE_REGISTRATION_CONFIRMED":
      return "Création du compte candidat.";
    case "CANDIDATE_PROFILE_UPDATED":
      return "Profil du candidat modifié";
    case "DOSSIER_DE_VALIDATION_SENT":
      return "Dossier de validation envoyé.";
    case "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED":
      return "Dossier de validation signalé.";
    case "CANDIDACY_SUBMITTED":
      return "Candidature envoyée.";
    case "CERTIFICATION_UPDATED":
      return `Certification modifiée. ${
        details
          ? `Nouvelle certification: ${details.certification.label} (${details.certification.codeRncp})`
          : ""
      }`;
    case "EXPERIENCE_ADDED":
      return "Expérience ajoutée.";
    case "EXPERIENCE_UPDATED":
      return "Expérience modifiée.";
    case "GOALS_UPDATED":
      return "Objectifs modifiés.";
    case "CONTACT_INFO_UPDATED":
      return "Informations de contact modifiées.";
    case "CANDIDACY_DELETED":
      return "Candidature supprimée.";
    case "CANDIDACY_ARCHIVED":
      return `Candidature archivée. ${details?.label ? `Informations complémentaires: ${details.label}` : ""}`;
    case "CANDIDACY_UNARCHIVED":
      return "Candidature désarchivée.";
    case "APPOINTMENT_INFO_UPDATED":
      return `Date du premier rendez-vous pédagogique modifiée. Nouvelle date ${format(
        details.firstAppointmentOccuredAt,
        "dd/MM/yyyy",
      )}`;
    case "CANDIDACY_TAKEN_OVER":
      return "Candidature prise en charge.";
    case "ORGANISM_SELECTED":
      return `Organisme d'accompagnement modifié. ${
        details ? `Nouvel organisme : ${details.organism.label}` : ""
      }`;
    case "TYPOLOGY_AND_CCN_INFO_UPDATED":
      return `Informations de typologie et de convention collective candidat modifiées. Nouvelle typologie: ${
        details.typology
      }. ${
        details.ccn
          ? `Nouvelle ccn: ${details.ccn?.label} (${details.ccn?.idcc}).`
          : ""
      }`;
    case "TRAINING_INFO_RESET":
      return "Parcours candidat réinitialisé.";
    case "TRAINING_FORM_SUBMITTED":
      return "Parcours candidat envoyé.";
    case "TRAINING_FORM_CONFIRMED":
      return "Parcours candidat confirmé.";
    case "CANDIDACY_DROPPED_OUT":
      return "Candidature abandonnée.";
    case "CANDIDACY_DROP_OUT_VALIDATED":
      return "Validation de l'abandon de la candidature.";
    case "CANDIDACY_DROP_OUT_CANCELED":
      return "Annulation de l'abandon de la candidature.";
    case "READY_FOR_JURY_ESTIMATED_DATE_UPDATED":
      return `Date prévisionenelle de finalisation ou de dépôt du dossier de validation modifiée. Nouvelle date ${format(
        details.readyForJuryEstimatedAt,
        "dd/MM/yyyy",
      )}`;
    case "FEASIBILITY_SENT":
      return "Dossier de faisabilité envoyé.";
    case "FEASIBILITY_MARKED_AS_COMPLETE":
      return "Dossier de faisabilité complet.";
    case "FEASIBILITY_MARKED_AS_INCOMPLETE":
      return "Dossier de faisabilité jugé incomplet.";
    case "FEASIBILITY_REJECTED":
      return "Dossier de faisabilité rejeté.";
    case "FEASIBILITY_VALIDATED":
      return "Dossier de faisabilité validé.";
    case "FUNDING_REQUEST_CREATED":
      return "Demande de financement envoyée.";
    case "PAYMENT_REQUEST_CREATED_OR_UPDATED":
      return "Demande de paiement créée ou modifiée.";
    case "PAYMENT_REQUEST_CONFIRMED":
      return "Demande de paiement confirmée.";
    case "JURY_EXAM_INFO_UPDATED":
      return `Informations jury modifiées. Résultat: ${details.examResult}. ${
        details.estimatedExamDate
          ? `Date d'examen prévue:  ${format(
              details.estimatedExamDate,
              "dd/MM/yyyy",
            )}.`
          : ""
      } ${
        details.actualExamDate
          ? `Date d'examen:  ${format(details.actualExamDate, "dd/MM/yyyy")}.`
          : ""
      }`;
    case "JURY_RESULT_UPDATED":
      return `Résultats jury modifiés. Résultat: ${details.result}.`;
    case "JURY_SESSION_SCHEDULED":
      return `Attribution d’une date de passage en jury au candidat. Date de passage: ${format(
        details.dateOfSession,
        "dd/MM/yyyy",
      )}. ${
        details.timeOfSession
          ? `Heure de passage: ${details.timeOfSession}`
          : ""
      }`;
    case "TYPE_ACCOMPAGNEMENT_UPDATED":
      return `Type d'accompagnement modifié. Nouveau type d'accompagnement ${details?.typeAccompagnement}`;
    case "CANDIDACY_ACTUALISATION":
      return "Candidature actualisée.";
    case "CADUCITE_CONTESTED":
      return "Contestation de la caducité de la candidature.";
    case "CADUCITE_INVALIDATED":
      return "Invalidation de la caducité de la candidature.";
    case "CADUCITE_CONFIRMED":
      return "Confirmation de la caducité de la candidature.";
    case "DFF_SENT_TO_CANDIDATE":
      return "Dossier de faisabilité envoyé au candidat pour validation.";
    case "DFF_VALIDATED_BY_CANDIDATE":
      return "Dossier de faisabilité validé par le candidat.";
    case "DFF_SENT_TO_CERTIFICATION_AUTHORITY":
      return "Dossier de faisabilité envoyé au certificateur.";
    case "CANDIDACY_DROPOUT_CONFIRMED_BY_CANDIDATE":
      return "Abandon de la candidature confirmé par le candidat";
    case "CANDIDACY_DROPOUT_CANCELED_BY_CANDIDATE":
      return "Annulation de l'abandon de la candidature par le candidat";
    default:
      return "Évenement inconnu";
  }
};
