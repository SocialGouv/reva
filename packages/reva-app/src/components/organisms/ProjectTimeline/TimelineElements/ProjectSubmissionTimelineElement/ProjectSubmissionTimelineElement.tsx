import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { projectProgress } from "utils/projectProgress";

export const ProjectSubmissionTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const progress = projectProgress(state.context);
  const isProjectComplete = progress === 100;

  return (
    <TimelineElement
      title="Envoi de votre candidature"
      status={
        state.context.candidacyStatus === "PROJET"
          ? isProjectComplete
            ? "active"
            : "disabled"
          : "readonly"
      }
    >
      {({ status }) =>
        status === "readonly" ? (
          <span data-test="project-submitted-label">Statut : effectué</span>
        ) : (
          <Button
            data-test="project-home-validate"
            disabled={status === "disabled"}
            nativeButtonProps={{
              onClick: () => mainService.send("VALIDATE_PROJECT"),
            }}
          >
            Envoyez votre candidature
          </Button>
        )
      }
    </TimelineElement>
  );
};
