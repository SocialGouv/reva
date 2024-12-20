import { useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useGetFeasibilityDematTimelineElementInfo } from "./useGetFeasibilityDematTimelineElementInfo";

export const FeasibilityDematTimelineElement = () => {
  const router = useRouter();

  const { candidacy } = useCandidacy();

  const { feasibility } = candidacy;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  const candidateHasConfirmedFeasibilityFile =
    !!dematerializedFeasibilityFile?.candidateConfirmationAt;

  const { informationComponent, status, badgeStatus } =
    useGetFeasibilityDematTimelineElementInfo();

  const buttonPriority = candidateHasConfirmedFeasibilityFile
    ? "secondary"
    : "primary";
  const buttonLabel = candidateHasConfirmedFeasibilityFile
    ? "Consulter votre dossier"
    : "Vérifier votre dossier";

  return (
    <TimelineElement
      title="Recevabilité"
      status={status}
      badge={badgeStatus}
      data-test="feasibility-timeline-element"
    >
      {!!dematerializedFeasibilityFile && (
        <>
          {informationComponent}
          {!!dematerializedFeasibilityFile.sentToCandidateAt && (
            <Button
              data-test="feasibility-timeline-element-check-button"
              className="mt-4"
              priority={buttonPriority}
              nativeButtonProps={{
                onClick: () => {
                  router.push("/validate-feasibility");
                },
              }}
            >
              {buttonLabel}
            </Button>
          )}
        </>
      )}
    </TimelineElement>
  );
};
