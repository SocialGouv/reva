export type AAPLogUserProfile = "ADMIN" | "AAP";

export type AAPLogEventTypeAndDetails =
  | {
      eventType:
        | "SUBCRIBTION_REQUEST_VALIDATED"
        | "MAISON_MERE_LEGAL_INFORMATION_UPDATED";
      details?: undefined;
    }
  | {
      eventType: "MAISON_MEREE_ORGANISMS_ISACTIVE_UPDATED";
      details: { isActive: boolean };
    };

export type AAPLog = {
  id: string;
  createdAt: Date;
  userProfile: AAPLogUserProfile;
} & AAPLogEventTypeAndDetails;
