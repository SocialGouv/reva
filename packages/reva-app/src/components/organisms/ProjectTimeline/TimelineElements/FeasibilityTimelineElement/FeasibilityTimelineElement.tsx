import { AuthenticatedLink } from "components/atoms/AuthenticatedLink/AuthenticatedLink";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { format } from "date-fns";
import { FeasibilityDecision } from "interface";

export const FeasibilityTimelineElement = () => {
  const { state } = useMainMachineContext();

  const { feasibility } = state.context;

  const PENDING = feasibility?.decision === FeasibilityDecision.PENDING;
  const INCOMPLETE = feasibility?.decision === FeasibilityDecision.INCOMPLETE;
  const ADMISSIBLE = feasibility?.decision === FeasibilityDecision.ADMISSIBLE;
  const REJECTED = feasibility?.decision === FeasibilityDecision.REJECTED;

  let text = `Si le dossier de faisabilité est jugé recevable par le certificateur, alors vous pourrez démarrer l'étape du Dossier de validation, avec l'accompagnement et les éventuelles formations prévues au moment de la Définition du parcours pédagogique.`;

  if (PENDING || INCOMPLETE) {
    text = `Votre dossier de faisabilité a été transmis au certificateur. Vous recevrez une réponse dans un délai de 2 mois maximum, par e-mail et dans certains cas en plus par courrier. Votre accompagnateur sera lui aussi informé de la décision du certificateur.`;
  }

  if (ADMISSIBLE && feasibility.decisionSentAt) {
    text = `Votre dossier de faisabilité a été jugé recevable par le certificateur le ${format(
      feasibility.decisionSentAt,
      "dd/MM/yyyy"
    )}. Votre accompagnateur va prendre contact avec vous prochainement pour démarrer votre accompagnement.`;
  }

  if (REJECTED) {
    text = `Votre dossier de faisabilité n'a pas été accepté par le certificateur, cela met donc fin à votre parcours France VAE.`;
  }

  const icon =
    PENDING || INCOMPLETE ? "fr-icon-time-fill" : "fr-icon-information-fill";

  return (
    <TimelineElement
      title="Recevabilité"
      status={!feasibility || PENDING || INCOMPLETE ? "disabled" : "readonly"}
      description={
        !!feasibility ? (
          <p className="text-sm text-dsfrGray-500 mt-4" role="status">
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
            <div className="flex text-dsfrGray-500 mt-2">
              <span className={`fr-icon ${icon} mr-2 self-center`} />
              <div>
                <p className="text-sm">{text}</p>
                {REJECTED && (
                  <>
                    {feasibility?.decisionComment &&
                      feasibility.decisionSentAt && (
                        <>
                          <br />

                          <p className="text-sm">
                            <strong>Commentaire du certificateur :</strong>
                            <br />
                            <span className="italic">
                              ”{feasibility.decisionComment}” - le{" "}
                              {format(feasibility.decisionSentAt, "dd/MM/yyyy")}
                            </span>
                          </p>
                        </>
                      )}

                    <br />
                    <p className="text-sm italic">
                      Pour plus d'informations, vous pouvez contacter votre
                      accompagnateur en lui écrivant à l'e-mail indiqué dans
                      l’étape “Mon accompagnateur” ci-dessus.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4">
              {feasibility.decisionFile && (
                <FileLink
                  text={feasibility.decisionFile.name}
                  url={feasibility.decisionFile.url}
                />
              )}
            </div>
          </>
        )
      }
    </TimelineElement>
  );
};

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink text={text} title={text} url={url} />
);
