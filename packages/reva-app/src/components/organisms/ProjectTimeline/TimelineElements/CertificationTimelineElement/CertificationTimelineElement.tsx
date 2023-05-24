import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const CertificationTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  return (
    <TimelineElement
      title="Diplôme visé"
      status={
        state.context.candidacyStatus === "PROJET"
          ? state.context.certification
            ? "editable"
            : "active"
          : "readonly"
      }
    >
      {({ status }) => (
        <>
          {state.context.certification && (
            <h4 data-test="certification-label" className="text-base mb-4">
              {state.context.certification?.label}
            </h4>
          )}

          {status !== "readonly" && (
            <Button
              data-test="project-home-select-certification"
              priority="secondary"
              onClick={() => mainService.send("CLOSE_SELECTED_CERTIFICATION")}
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
