export type AAPLogUserProfile = "ADMIN" | "AAP";

export type AAPLogEventTypeAndDetails =
  | {
      eventType:
        | "SUBCRIBTION_REQUEST_VALIDATED"
        | "MAISON_MERE_LEGAL_INFORMATION_UPDATED"
        | "ORGANISM_REMOTE_GENERAL_INFORMATION_UPDATED";
      details?: undefined;
    }
  | {
      eventType: "MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED";
      details: { isActive: boolean };
    }
  | {
      eventType: "MAISON_MERE_SIGNALIZED_STATUS_UPDATED";
      details: { isSignalized: boolean };
    }
  | {
      eventType: "MAISON_MERE_FINANCING_METHODS_UPDATED";
      details: { isMCFCompatible: boolean };
    }
  | {
      eventType: "MAISON_MERE_FINANCING_METHODS_UPDATED";
      details: { isMCFCompatible: boolean };
    }
  | {
      eventType: "ORGANISM_SEARCH_RESULTS_VISIBILITY_UPDATED";
      details: {
        organismLabel: string;
        modaliteAccompagnement: "A_DISTANCE" | "LIEU_ACCUEIL";
        visibleInSearchResults: boolean;
      };
    };

export type AAPLog = {
  id: string;
  createdAt: Date;
  userProfile: AAPLogUserProfile;
} & AAPLogEventTypeAndDetails;
