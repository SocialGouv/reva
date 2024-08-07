import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const CertificationTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const { getTimelineElementStatus } = useProjectTimeline();
  return (
    <TimelineElement
      title="Diplôme visé"
      status={getTimelineElementStatus({
        previousElementFilled: true,
        currentElementFilled: !!state.context.certification,
      })}
    >
      {({ status }) => (
        <>
          {state.context.certification && (
            <h4
              data-test="certification-label"
              className="mb-4 text-base font-normal"
            >
              {state.context.certification?.label}
            </h4>
          )}

          {status !== "readonly" && (
            <Button
              data-test="project-home-select-certification"
              priority="secondary"
              onClick={() => mainService.send("OPEN_CERTIFICATIONS_SELECTION")}
              disabled={status === "disabled"}
            >
              {state.context.certification
                ? "Modifiez votre diplôme"
                : "Choisir votre diplôme"}
            </Button>
          )}
        </>
      )}
    </TimelineElement>
  );
};
