import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { projectProgress } from "utils/projectProgress";

export const ProjectSubmissionTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const progress = projectProgress(state.context);
  const isProjectComplete = progress === 100;

  const candidacyCreationDisabled = state.context.activeFeatures.includes(
    "CANDIDACY_CREATION_DISABLED",
  );

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
          <span data-test="project-submitted-label">Statut : envoyée</span>
        ) : (
          <>
            {status === "active" && candidacyCreationDisabled && (
              <div className="flex items-center mb-4 max-w-xl">
                <span className="fr-icon fr-icon-warning-fill text-red-500 mr-2" />
                <p className="text-sm mb-0">
                  Le dépôt de nouvelles candidatures est temporairement
                  indisponible. Nous vous remercions de votre patience et nous
                  excusons pour tout désagrément.
                </p>
              </div>
            )}
            <Button
              data-test="project-home-validate"
              disabled={candidacyCreationDisabled || status === "disabled"}
              nativeButtonProps={{
                onClick: () => mainService.send("VALIDATE_PROJECT"),
              }}
            >
              Envoyez votre candidature
            </Button>
          </>
        )
      }
    </TimelineElement>
  );
};
