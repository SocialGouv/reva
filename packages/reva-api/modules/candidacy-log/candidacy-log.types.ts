import { FinanceModule } from "@prisma/client";

export type CandidacyLogUserProfile =
  | "ADMIN"
  | "CANDIDAT"
  | "CERTIFICATEUR"
  | "AAP";

export type CandidacyLogEventTypeAndDetails =
  | {
      eventType:
        | "CANDIDATE_CONTACT_INFORMATION_UPDATED"
        | "CANDIDATE_CIVIL_INFORMATION_UPDATED"
        | "CANDIDATE_UPDATED"
        | "CANDIDATE_REGISTRATION_CONFIRMED"
        | "CANDIDATE_PROFILE_UPDATED"
        | "DOSSIER_DE_VALIDATION_SENT"
        | "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED"
        | "DOSSIER_DE_VALIDATION_VERIFIED"
        | "CANDIDACY_SUBMITTED"
        | "EXPERIENCE_ADDED"
        | "EXPERIENCE_UPDATED"
        | "GOALS_UPDATED"
        | "CONTACT_INFO_UPDATED"
        | "CANDIDACY_DELETED"
        | "CANDIDACY_UNARCHIVED"
        | "CANDIDACY_TAKEN_OVER"
        | "TRAINING_INFO_RESET"
        | "TRAINING_FORM_SUBMITTED"
        | "TRAINING_FORM_CONFIRMED"
        | "CANDIDACY_DROPPED_OUT"
        | "CANDIDACY_DROP_OUT_CANCELED"
        | "CANDIDACY_DROP_OUT_VALIDATED"
        | "ADMISSIBILITY_FVAE_UPDATED"
        | "FEASIBILITY_VALIDATED"
        | "FEASIBILITY_REJECTED"
        | "FEASIBILITY_MARKED_AS_COMPLETE"
        | "FEASIBILITY_MARKED_AS_INCOMPLETE"
        | "FUNDING_REQUEST_CREATED"
        | "PAYMENT_REQUEST_CREATED_OR_UPDATED"
        | "PAYMENT_REQUEST_CONFIRMED"
        | "CANDIDACY_ACTUALISATION"
        | "CADUCITE_CONTESTED"
        | "CADUCITE_INVALIDATED"
        | "CADUCITE_CONFIRMED"
        | "DFF_SENT_TO_CANDIDATE"
        | "DFF_VALIDATED_BY_CANDIDATE"
        | "CANDIDACY_DROPOUT_CONFIRMED_BY_CANDIDATE"
        | "CANDIDACY_DROPOUT_CANCELED_BY_CANDIDATE"
        | "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_CONFIRMED"
        | "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_INVALIDATED";
      details?: undefined;
    }
  | {
      eventType: "CANDIDACY_ARCHIVED";
      details?: {
        label: string;
      };
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
    }
  | {
      eventType: "TYPOLOGY_AND_CCN_INFO_UPDATED";
      details: {
        ccn?: { id: string; idcc: string; label: string };
        typology: string;
      };
    }
  | {
      eventType: "READY_FOR_JURY_ESTIMATED_DATE_UPDATED";
      details: {
        readyForJuryEstimatedAt: Date;
      };
    }
  | {
      eventType: "JURY_EXAM_INFO_UPDATED";
      details: {
        examResult: string | null;
        estimatedExamDate: Date | null;
        actualExamDate: Date | null;
      };
    }
  | {
      eventType: "JURY_RESULT_UPDATED";
      details: {
        result: string;
      };
    }
  | {
      eventType: "JURY_SESSION_SCHEDULED";
      details: { dateOfSession: Date; timeOfSession?: string };
    }
  | {
      eventType: "ADMISSIBILITY_FVAE_UPDATED";
      details: { isAlreadyAdmissible: boolean; expiresAt: Date | null };
    }
  | {
      eventType: "TYPE_ACCOMPAGNEMENT_UPDATED";
      details: { typeAccompagnement: string; reason?: string };
    }
  | {
      eventType: "ADMIN_CUSTOM_ACTION";
      details: { message: string };
    }
  | {
      eventType: "FINANCE_MODULE_UPDATED";
      details: { financeModule: FinanceModule; reason?: string };
    }
  | {
      eventType: "CANDIDATE_CONTACT_DETAILS_UPDATED";
      details: { phone: string; email?: string };
    }
  | {
      eventType: "FEASIBILITY_SENT";
      //details, certificationAuthorityId and certificationAuthorityLabel are optional because at first we did not log them. So there is some existing logs without them.
      details?: {
        certificationAuthorityId?: string;
        certificationAuthorityLabel?: string;
      };
    }
  | {
      eventType: "DFF_SENT_TO_CERTIFICATION_AUTHORITY";
      //details, certificationAuthorityId and certificationAuthorityLabel are optional because at first we did not log them. So there is some existing logs without them.
      details?: {
        certificationAuthorityId?: string;
        certificationAuthorityLabel?: string;
      };
    }
  | {
      eventType: "CANDIDACY_TRANSFERRED_TO_CERTIFICATION_AUTHORITY";
      details: {
        certificationAuthorityId: string;
        certificationAuthorityLabel: string;
        certificationAuthorityTransferReason: string;
      };
    }
  | {
      eventType: "CANDIDACY_TRANSFERRED_TO_CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";
      details: {
        certificationAuthorityLocalAccountId: string;
        certificationAuthorityLocalAccountAccountEmail: string;
        certificationAuthorityTransferReason: string;
      };
    }
  | {
      eventType: "JURY_DECISION_REVOKED";
      details: { reason?: string };
    }
  | {
      eventType: "FEASIBILITY_DECISION_REVOKED";
      details?: { reason?: string };
    }
  | {
      eventType: "END_ACCOMPAGNEMENT_SUBMITTED";
      details: { endAccompagnementDate: Date };
    };

export type CandidacyLog = {
  id: string;
  createdAt: Date;
  userProfile: CandidacyLogUserProfile;
} & CandidacyLogEventTypeAndDetails;
