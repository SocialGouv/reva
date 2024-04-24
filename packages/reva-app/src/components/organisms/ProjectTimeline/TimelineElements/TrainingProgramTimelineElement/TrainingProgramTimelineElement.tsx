import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const TrainingProgramTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();

  const status = ["PROJET", "VALIDATION", "PRISE_EN_CHARGE"].includes(
    state.context.candidacyStatus
  )
    ? "disabled"
    : ["PARCOURS_ENVOYE"].includes(state.context.candidacyStatus)
    ? "active"
    : "readonly";
  return (
    <TimelineElement
      title="Validation de parcours"
      description={
        <p className="text-sm text-dsfrGray-500 mt-4 mb-0" role="status">
          {state.context.candidacyStatus === "PROJET" ? null : [
              "VALIDATION",
              "PRISE_EN_CHARGE",
            ].includes(state.context.candidacyStatus) ? (
            <>
              Votre organisme d'accompagnement va bientôt vous contacter pour
              définir avec vous votre parcours d’accompagnement. Vous pourrez
              prochainement valider le nombre d’heures d’accompagnement et de
              formation prévues.
            </>
          ) : (
            <>
              Validez le nombre d’heures d’accompagnement et de formation défini
              par votre référent
            </>
          )}
        </p>
      }
      status={status}
    >
      {({ status }) =>
        status === "readonly" ? (
          <Button
            data-test="view-training-program-button"
            className="mt-2"
            priority="secondary"
            nativeButtonProps={{
              onClick: () => mainService.send("OPEN_TRAINING_PROGRAM_SUMMARY"),
            }}
          >
            Consultez votre parcours
          </Button>
        ) : (
          state.context.candidacyStatus === "PARCOURS_ENVOYE" && (
            <Button
              data-test="validate-training-program-button"
              className="mt-2"
              priority="secondary"
              nativeButtonProps={{
                onClick: () =>
                  mainService.send("OPEN_TRAINING_PROGRAM_SUMMARY"),
                disabled: status === "disabled",
              }}
            >
              Validez votre parcours
            </Button>
          )
        )
      }
    </TimelineElement>
  );
};
