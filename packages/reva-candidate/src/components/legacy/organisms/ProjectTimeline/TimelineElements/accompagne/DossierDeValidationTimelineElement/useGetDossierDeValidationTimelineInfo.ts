import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";

interface GetDossierDeValidationTimelineInfoResult {
  text: string;
  status: TimeLineElementStatus;
  icon: string;
}

const INFORMATION_ICON = "fr-icon-information-fill";
const TIME_ICON = "fr-icon-time-fill";

const DEFAULT_TEXT =
  "Pensez à prévenir votre accompagnateur quand vous avez terminé la rédaction de votre dossier de validation. Ce dernier se chargera de le transmettre au certificateur.";

const DV_HAS_BEEN_SENT_TEXT =
  "Votre dossier de validation a été transmis au certificateur.";

export const useGetDossierDeValidationTimelineInfo =
  (): GetDossierDeValidationTimelineInfoResult => {
    const { candidacy } = useCandidacy();
    const { activeDossierDeValidation: dossierDeValidation, feasibility } =
      candidacy;
    const { isFeatureActive } = useFeatureFlipping();
    const candidacyActualisationIsActive = isFeatureActive(
      "candidacy_actualisation",
    );

    const PENDING = dossierDeValidation?.decision === "PENDING";
    const INCOMPLETE = dossierDeValidation?.decision === "INCOMPLETE";
    const FEASIBILITY_ADMISSIBLE = feasibility?.decision === "ADMISSIBLE";

    const isCaduque = candidacy.isCaduque;

    switch (true) {
      case !FEASIBILITY_ADMISSIBLE:
        return {
          text: "",
          status: "disabled",
          icon: INFORMATION_ICON,
        };

      case isCaduque && candidacyActualisationIsActive:
        return {
          status: "active",
          icon: INFORMATION_ICON,
          text: DV_HAS_BEEN_SENT_TEXT,
        };

      case PENDING:
      case INCOMPLETE:
        return {
          text: DV_HAS_BEEN_SENT_TEXT,
          status: "readonly",
          icon: INFORMATION_ICON,
        };

      default:
        return {
          text: DEFAULT_TEXT,
          status: "active",
          icon: TIME_ICON,
        };
    }
  };
