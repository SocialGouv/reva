import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  const canComplete = !candidacy.feasibility || candidacy.feasibility.decision == "INCOMPLETE"

  if (canComplete) {
    status = "editable";
  }

  if (candidacy.status !== "PROJET") {
    status = "readonly";
  }

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      status={status}
      isStepComplete={!canComplete}
      data-test="feasibility-timeline-element"
    >
      {status !== "readonly" && (
        <Button
          data-test="feasibility-timeline-element-update-button"
          priority="primary"
          onClick={() => {
            router.push("/feasibility");
          }}
          disabled={status === "disabled"}
        >
          Compléter
        </Button>
      )}
    </TimelineElement>
  );
};
