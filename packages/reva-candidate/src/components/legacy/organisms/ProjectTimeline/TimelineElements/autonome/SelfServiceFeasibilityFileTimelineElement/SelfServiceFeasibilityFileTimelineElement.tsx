import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import Badge from "@codegouvfr/react-dsfr/Badge";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  const canComplete = !candidacy.feasibility || candidacy.feasibility.decision == "INCOMPLETE"

  if (canComplete) {
    status = "editable";
  }

  if (candidacy.status !== "PROJET" && !canComplete) {
    status = "readonly";
  }

  let badge = null;

  if (canComplete) {
    badge = (
      <Badge severity="warning">
        À compléter
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "PENDING") {
    badge = (
      <Badge severity="info">
        Envoyé
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "ADMISSIBLE") {
    badge = (
      <Badge severity="success">
        Validé
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "REJECTED") {
    badge = (
      <Badge severity="error">
        Non-recevable
      </Badge>
    );
  }

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      description="Un document important pour résumer vos expériences et tenter d’obtenir votre recevabilité !"
      status={status}
      badge={badge}
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
