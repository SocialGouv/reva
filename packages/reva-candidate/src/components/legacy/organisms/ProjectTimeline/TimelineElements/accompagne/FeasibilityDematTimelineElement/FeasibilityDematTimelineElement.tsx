import { useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Feasibility } from "@/graphql/generated/graphql";
import { getFeasibilityTimelineElementInfo } from "./getFeasibilityTimelineElementInfo";

export const FeasibilityDematTimelineElement = () => {
  const router = useRouter();

  const { candidacy } = useCandidacy();

  const { feasibility } = candidacy;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  const candidateHasConfirmedFeasibilityFile =
    !!dematerializedFeasibilityFile?.candidateConfirmationAt;

  const { informationComponent, status, badgeStatus } =
    getFeasibilityTimelineElementInfo({
      feasibility: feasibility as Feasibility | null,
    });

  const buttonPriority = candidateHasConfirmedFeasibilityFile
    ? "secondary"
    : "primary";
  const buttonLabel = candidateHasConfirmedFeasibilityFile
    ? "Consulter votre dossier"
    : "Vérifier votre dossier";

  return (
    <TimelineElement title="Recevabilité" status={status} badge={badgeStatus}>
      {!!dematerializedFeasibilityFile && (
        <>
          {informationComponent}
          {!!dematerializedFeasibilityFile.sentToCandidateAt && (
            <Button
              data-test="vérifier-votre-dossier-de-faisabilité"
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
