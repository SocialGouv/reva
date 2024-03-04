import { CandidacyEventType } from "../candidacy-log.types";

export const getCandidacyLogMessage = ({
  eventType,
  details,
}: {
  eventType: CandidacyEventType;
  details?: any;
}) => {
  switch (eventType) {
    case "CANDIDATE_REGISTRATION_CONFIRMED":
      return "Création du compte candidat.";
    case "DOSSIER_DE_VALIDATION_SENT":
      return "Dossier de validation envoyé.";
    case "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED":
      return "Dossier de validation signalé.";
    case "CANDIDACY_SUBMITTED":
      return "Candidature envoyée.";
    case "CERTIFICATION_UPDATED":
      return "Certification modifiée.";
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
      return "Candidature archivée.";
    case "CANDIDACY_UNARCHIVED":
      return "Candidature désarchivée.";
    case "APPOINTMENT_INFO_UPDATED":
      return "Date du premier rendez-vous pédagogique modifiée.";
    case "CANDIDACY_TAKEN_OVER":
      return "Candidature prise en charge.";
    case "ORGANISM_SELECTED":
      return `Organisme de formation modifié. ${details ? `Nouvel organisme: ${details.organism.label}` : ""}`;
    case "TYPOLOGY_AND_CCN_INFO_UPDATED":
      return "Informations de typologie et de convention collective candidat modifiées.";
    case "TRAINING_FORM_SUBMITTED":
      return "Parcours candidat envoyé.";
    case "TRAINING_FORM_CONFIRMED":
      return "Parcours candidat confirmé.";
    case "CANDIDACY_DROPPED_OUT":
      return "Candidature abandonnée.";
    case "CANDIDACY_DROP_OUT_CANCELED":
      return "Annulation de l'abandon de la candidature.";
    case "ADMISSIBILITY_UPDATED":
      return "Information de recevabilité modifiées.";
    case "READY_FOR_JURY_ESTIMATED_DATE_UPDATED":
      return "Date prévisionenelle de finalisation ou de dépôt du dossier de validation modifiée.";
    case "FEASIBILITY_SENT":
      return "Dossier de faisabilité envoyé.";
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
      return "Informations jury modifiées.";
    case "JURY_RESULT_UPDATED":
      return "Résultats jury modifiés.";
    default:
      return eventType;
  }
};
