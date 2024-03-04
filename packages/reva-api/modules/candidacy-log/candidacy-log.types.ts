export type CandidacyLogUserProfile =
  | "ADMIN"
  | "CANDIDAT"
  | "CERTIFICATEUR"
  | "AAP";

export type CandidacyLogEventTypeAndDetails =
  | {
      eventType:
        | "CANDIDATE_REGISTRATION_CONFIRMED"
        | "DOSSIER_DE_VALIDATION_SENT"
        | "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED"
        | "CANDIDACY_SUBMITTED"
        | "EXPERIENCE_ADDED"
        | "EXPERIENCE_UPDATED"
        | "GOALS_UPDATED"
        | "CONTACT_INFO_UPDATED"
        | "CANDIDACY_DELETED"
        | "CANDIDACY_ARCHIVED"
        | "CANDIDACY_UNARCHIVED"
        | "CANDIDACY_TAKEN_OVER"
        | "TYPOLOGY_AND_CCN_INFO_UPDATED"
        | "TRAINING_FORM_SUBMITTED"
        | "TRAINING_FORM_CONFIRMED"
        | "CANDIDACY_DROPPED_OUT"
        | "CANDIDACY_DROP_OUT_CANCELED"
        | "ADMISSIBILITY_UPDATED"
        | "READY_FOR_JURY_ESTIMATED_DATE_UPDATED"
        | "FEASIBILITY_SENT"
        | "FEASIBILITY_VALIDATED"
        | "FEASIBILITY_REJECTED"
        | "FEASIBILITY_MARKED_AS_INCOMPLETE"
        | "FUNDING_REQUEST_CREATED"
        | "PAYMENT_REQUEST_CREATED_OR_UPDATED"
        | "PAYMENT_REQUEST_CONFIRMED"
        | "JURY_EXAM_INFO_UPDATED"
        | "JURY_RESULT_UPDATED";
      details?: undefined;
    }
  | {
      eventType: "CERTIFICATION_UPDATED";
      details: {
        certification: { id: string; label: string; codeRncp: string };
      };
    }
  | {
      eventType: "ORGANISM_SELECTED";
      details: { organism: { id: string; label: string } };
    }
  | {
      eventType: "APPOINTMENT_INFO_UPDATED";
      details: { firstAppointmentOccuredAt: Date };
    };

export type CandidacyLog = {
  id: string;
  createdAt: Date;
  userProfile: CandidacyLogUserProfile;
} & CandidacyLogEventTypeAndDetails;

export type CandidacyEventType = CandidacyLog["eventType"];
