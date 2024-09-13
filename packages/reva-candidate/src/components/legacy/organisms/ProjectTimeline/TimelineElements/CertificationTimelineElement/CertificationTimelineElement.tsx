import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { FundingCallOut } from "../../../../../funding-call-out/FundingCallOut";

export const CertificationTimelineElement = () => {
  const router = useRouter();

  const { canEditCandidacy, candidacy } = useCandidacy();

  const { certification } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (certification) {
    status = "editable";
  }

  const { isFeatureActive } = useFeatureFlipping();
  const affichageTypesFinancementCandidatureFeatureActive = isFeatureActive(
    "AFFICHAGE_TYPES_FINANCEMENT_CANDIDATURE",
  );

  const candidacyStatus = candidacy.status;

  const showFundingCallOut =
    affichageTypesFinancementCandidatureFeatureActive &&
    candidacyStatus === "PROJET";

  return (
    <TimelineElement title="Diplôme visé" status={status}>
      <div className="flex flex-col md:flex-row basis-1/2 gap-6">
        <div className="flex flex-col">
          {certification && (
            <h4
              data-test="certification-label"
              className="mb-4 text-base font-normal"
            >
              {certification.label}
            </h4>
          )}

          {status !== "readonly" && (
            <Button
              data-test="project-home-set-certification"
              priority="secondary"
              onClick={() => {
                router.push("set-certification");
              }}
            >
              {certification
                ? "Modifiez votre diplôme"
                : "Choisir votre diplôme"}
            </Button>
          )}
        </div>
        {showFundingCallOut && (
          <FundingCallOut className="basis-1/2 ml-auto mr-6 md:mr-0" />
        )}
      </div>
    </TimelineElement>
  );
};
