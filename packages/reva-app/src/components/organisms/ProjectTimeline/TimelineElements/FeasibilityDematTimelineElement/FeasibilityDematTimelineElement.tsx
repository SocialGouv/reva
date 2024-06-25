import Button from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const FeasibilityDematTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();

  const { feasibilityDemat: feasibility } = state.context;

  const PENDING = true;
  const INCOMPLETE = false;
  const ADMISSIBLE = false;
  const REJECTED = false;

  let text = `Si le dossier de faisabilité est jugé recevable par le certificateur, alors vous pourrez démarrer l'étape du Dossier de validation, avec l'accompagnement et les éventuelles formations prévues au moment de la Définition du parcours pédagogique.`;

  const icon = "fr-icon-time-fill";

  return (
    <TimelineElement
      title="Recevabilité"
      status={
        ADMISSIBLE || REJECTED
          ? "readonly"
          : PENDING || INCOMPLETE
          ? "active"
          : "disabled"
      }
      description={
        !!feasibility ? (
          <p className="text-sm text-dsfrGray-500 mt-4 mb-0" role="status">
            À partir de vos expériences et de votre projet, votre accompagnateur
            prépare un dossier de faisabilité. Ce dossier sera ensuite transmis
            au certificateur pour l'obtention de la recevabilité, nécessaire
            pour démarrer votre parcours.
          </p>
        ) : undefined
      }
    >
      {() =>
        !!feasibility && (
          <>
            <div className="flex text-dsfrGray-500">
              <span className={`fr-icon ${icon} mr-2 self-center mb-6`} />
              <div>
                <p className="text-sm italic">{text}</p>
              </div>
            </div>
            <div>
              <Button
                data-test="vérifier-votre-dossier-de-faisabilité"
                priority="primary"
                disabled={
                  !feasibility.isComplete || !!feasibility.swornStatementFileId
                }
                nativeButtonProps={{
                  onClick: () => {
                    mainService.send("OPEN_FEASIBILITY_DEMAT_SUBMISSION");
                  },
                }}
              >
                Vérifiez votre dossier
              </Button>
            </div>
          </>
        )
      }
    </TimelineElement>
  );
};
