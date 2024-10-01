import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const DossierDeValidationAutonomeTimelineElement = () => {
  const status: TimeLineElementStatus = "disabled";

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      data-test="dossier-de-validation-autonome-timeline-element"
      description="Le dossier de validation sera présenté au moment du jury."
    >
      <Button
        data-test="dossier-de-validation-autonome-timeline-element-update-button"
        priority="secondary"
        disabled={status === "disabled"}
      >
        Compléter
      </Button>
    </TimelineElement>
  );
};
