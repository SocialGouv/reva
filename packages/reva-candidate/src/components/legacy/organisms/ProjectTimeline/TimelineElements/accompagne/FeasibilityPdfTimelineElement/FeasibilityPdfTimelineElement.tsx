import { format } from "date-fns";

import { AuthenticatedLink } from "@/components/legacy/atoms/AuthenticatedLink/AuthenticatedLink";

import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useGetFeasibilityPdfTimelineElementInfo } from "./useGetFeasibilityPdfTimelineElementInfo";

export const FeasibilityPdfTimelineElement = () => {
  const { candidacy } = useCandidacy();

  const { feasibility } = candidacy;

  const { icon, status, text, badge } =
    useGetFeasibilityPdfTimelineElementInfo();

  const REJECTED = feasibility?.decision === "REJECTED";

  return (
    <TimelineElement
      title="Recevabilité"
      status={status}
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
      badge={badge}
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
                    Pour plus d'informations, vous pouvez contacter votre
                    accompagnateur en lui écrivant à l'e-mail indiqué dans
                    l'étape “Mon accompagnateur” ci-dessus.
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
