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
        organismId: string;
        organismLabel: string;
        modaliteAccompagnement: "A_DISTANCE" | "LIEU_ACCUEIL";
        visibleInSearchResults: boolean;
      };
    }
  | {
      eventType: "ORGANISM_DEGREES_AND_FORMACODES_UPDATED";
      details: {
        organismId: string;
        organismLabel: string;
        modaliteAccompagnement: "A_DISTANCE" | "LIEU_ACCUEIL";
      };
    }
  | {
      eventType: "LIEU_ACCUEIL_CREATED";
      details: {
        organismId: string;
        organismLabel: string;
      };
    }
  | {
      eventType: "ORGANISM_ONSITE_GENERAL_INFORMATION_UPDATED";
      details: {
        organismId: string;
        organismLabel: string;
      };
    }
  | {
      eventType: "ORGANISM_ACCOUNT_CREATED"; //deprecated
      details: {
        organismId: string;
        organismLabel: string;
        accountEmail: string;
      };
    }
  | {
      eventType: "ORGANISM_ACCOUNT_CREATED_V2";
      details: {
        maisonMereAAPId: string;
        maisonMereAAPRaisonSociale: string;
        accountEmail: string;
      };
    }
  | {
      eventType: "ORGANISM_ACCOUNT_UPDATED"; //deprecated
      details: {
        organismId: string;
        organismLabel: string;
        accountEmail: string;
      };
    }
  | {
      eventType: "ORGANISM_ACCOUNT_UPDATED_V2";
      details: {
        maisonMereAAPId: string;
        maisonMereAAPRaisonSociale: string;
        accountEmail: string;
      };
    };

export type AAPLog = {
  id: string;
  createdAt: Date;
  userProfile: AAPLogUserProfile;
} & AAPLogEventTypeAndDetails;
