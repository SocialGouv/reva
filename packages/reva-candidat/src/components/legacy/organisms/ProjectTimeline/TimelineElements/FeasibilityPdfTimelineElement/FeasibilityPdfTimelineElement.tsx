import { format } from "date-fns";

import { AuthenticatedLink } from "@/components/legacy/atoms/AuthenticatedLink/AuthenticatedLink";

import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidateWithCandidacy } from "@/hooks/useCandidateWithCandidacy";

export const FeasibilityPdfTimelineElement = () => {
  const { candidacy } = useCandidateWithCandidacy();

  if (!candidacy) {
    return null;
  }

  const { feasibility } = candidacy;

  const PENDING = feasibility?.decision === "PENDING";
  const INCOMPLETE = feasibility?.decision === "INCOMPLETE";
  const ADMISSIBLE = feasibility?.decision === "ADMISSIBLE";
  const REJECTED = feasibility?.decision === "REJECTED";

  let text = `Si le dossier de faisabilité est jugé recevable par le certificateur, alors vous pourrez démarrer l’étape du Dossier de validation, avec l’accompagnement et les éventuelles formations prévues au moment de la Définition du parcours pédagogique.`;

  if (PENDING || INCOMPLETE) {
    text = `Votre dossier de faisabilité a été transmis au certificateur. Vous recevrez une réponse dans un délai de 2 mois maximum, par e-mail et dans certains cas en plus par courrier. Votre accompagnateur sera lui aussi informé de la décision du certificateur.`;
  }

  if (ADMISSIBLE && feasibility.decisionSentAt) {
    text = `Votre dossier de faisabilité a été jugé recevable par le certificateur le ${format(
      feasibility.decisionSentAt,
      "dd/MM/yyyy",
    )}. Votre accompagnateur va prendre contact avec vous prochainement pour démarrer votre accompagnement.`;
  }

  if (REJECTED) {
    text = `Votre dossier de faisabilité n’a pas été accepté par le certificateur, cela met donc fin à votre parcours France VAE.`;
  }

  const icon =
    PENDING || INCOMPLETE ? "fr-icon-time-fill" : "fr-icon-information-fill";

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
            au certificateur pour l’obtention de la recevabilité, nécessaire
            pour démarrer votre parcours.
          </p>
        ) : undefined
      }
    >
      {!!feasibility && (
        <>
          <div className="flex text-dsfrGray-500">
            <span className={`fr-icon ${icon} mr-2 self-center mb-6`} />
            <div>
              <p className="text-sm italic">{text}</p>
              {REJECTED && (
                <>
                  {feasibility?.decisionComment &&
                    feasibility.decisionSentAt && (
                      <>
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

                  <p className="text-sm italic">
                    Pour plus d’informations, vous pouvez contacter votre
                    accompagnateur en lui écrivant à l’e-mail indiqué dans
                    l’étape “Mon accompagnateur” ci-dessus.
                  </p>
                </>
              )}
            </div>
          </div>
          <div>
            {feasibility.decisionFile && (
              <FileLink
                text={feasibility.decisionFile.name}
                url={feasibility.decisionFile.url}
              />
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );
};

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink text={text} title={text} url={url} className="mb-0" />
);
