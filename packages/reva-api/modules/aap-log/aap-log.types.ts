export type AAPLogUserProfile = "ADMIN" | "AAP";

export type AAPLogEventTypeAndDetails = {
  eventType: "SUBCRIBTION_REQUEST_VALIDATED";
  details?: undefined;
};

export type AAPLog = {
  id: string;
  createdAt: Date;
  userProfile: AAPLogUserProfile;
} & AAPLogEventTypeAndDetails;
