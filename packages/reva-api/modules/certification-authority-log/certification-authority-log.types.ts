export type CertificationAuthorityLogUserProfile =
  | "ADMIN"
  | "CERTIFICATION_AUTHORITY"
  | "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";

export type CertificationAuthorityLogEventTypeAndDetails =
  | {
      eventType: "UNKNOWN";
      details?: undefined;
    }
  | {
      eventType: "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED";
      details: {
        candidacyId: string;
      };
    };

export type CertificationAuthorityLog = {
  id: string;
  createdAt: Date;
  userProfile: CertificationAuthorityLogUserProfile;
} & CertificationAuthorityLogEventTypeAndDetails;
