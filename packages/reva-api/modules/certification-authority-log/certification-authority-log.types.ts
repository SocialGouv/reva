export type CertificationAuthorityLogUserProfile =
  | "ADMIN"
  | "CERTIFICATION_AUTHORITY"
  | "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";

export type CertificationAuthorityLogEventTypeAndDetails = {
  eventType: "UNKNOWN";
  details?: undefined;
};

export type CertificationAuthorityLog = {
  id: string;
  createdAt: Date;
  userProfile: CertificationAuthorityLogUserProfile;
} & CertificationAuthorityLogEventTypeAndDetails;
