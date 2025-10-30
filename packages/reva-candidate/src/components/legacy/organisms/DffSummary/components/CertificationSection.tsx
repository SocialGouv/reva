import Accordion from "@codegouvfr/react-dsfr/Accordion";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { useMemo } from "react";

import { Certification, Prerequisite } from "@/graphql/generated/graphql";

export default function CertificationSection({
  option,
  firstForeignLanguage,
  secondForeignLanguage,
  certification,
  prerequisites,
  isCertificationPartial,
}: {
  option?: string | null;
  firstForeignLanguage?: string | null;
  secondForeignLanguage?: string | null;
  certification?: Certification | null;
  prerequisites?: Prerequisite[] | null;
  isCertificationPartial: boolean;
}) {
  const prequisitesByStatus = useMemo(() => {
    return {
      acquired: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "ACQUIRED",
      ),
      inProgress: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "IN_PROGRESS",
      ),
      recommended: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "RECOMMENDED",
      ),
    };
  }, [prerequisites]);
  const noPrerequisites = !prerequisites?.length;

  return (
    <section>
      <div className="flex">
        <span className="fr-icon-award-fill fr-icon--lg mr-2" />
        <h2>Certification visée</h2>
      </div>
      <h4 className="mb-2">{certification?.label}</h4>
      <p className="text-sm text-dsfr-light-text-mention-grey">
        RNCP {certification?.codeRncp}
      </p>
      {!!option && (
        <dl className="my-4">
          <dt id="certification-option-label" className="font-normal">
            Option ou parcours :
          </dt>
          <dd
            aria-labelledby="certification-option-label"
            className="font-medium"
          >
            {option}
          </dd>
        </dl>
      )}
      {(firstForeignLanguage || secondForeignLanguage) && (
        <div className="flex gap-2 mb-4">
          {firstForeignLanguage && (
            <dl className="flex flex-col flex-1">
              <dt id="certification-first-language-label">
                Langue vivante 1 :
              </dt>
              <dd
                aria-labelledby="certification-first-language-label"
                className="font-medium"
              >
                {firstForeignLanguage}
              </dd>
            </dl>
          )}
          {secondForeignLanguage && (
            <dl className="flex flex-col flex-1">
              <dt id="certification-second-language-label">
                Langue vivante 2 :
              </dt>
              <dd
                aria-labelledby="certification-second-language-label"
                className="font-medium"
              >
                {secondForeignLanguage}
              </dd>
            </dl>
          )}
        </div>
      )}
      <CallOut>
        {isCertificationPartial
          ? "Un ou plusieurs bloc(s) de compétences visé(s)"
          : "La certification dans sa totalité"}
      </CallOut>

      <section className="mt-4">
        <h5 className="mb-0">Prérequis obligatoires</h5>
        <div className="mt-4">
          {noPrerequisites && (
            <p>
              Il n&apos;y a pas de prérequis obligatoires pour cette
              certification
            </p>
          )}
          {!!prequisitesByStatus?.acquired?.length && (
            <Accordion label="Acquis" defaultExpanded>
              <ul>
                {prequisitesByStatus?.acquired?.map((prerequisite) => (
                  <li key={prerequisite?.id}>{prerequisite?.label}</li>
                ))}
              </ul>
            </Accordion>
          )}
          {!!prequisitesByStatus?.inProgress?.length && (
            <Accordion label="En cours" defaultExpanded>
              <ul>
                {prequisitesByStatus?.inProgress?.map((prerequisite) => (
                  <li key={prerequisite?.id}>{prerequisite?.label}</li>
                ))}
              </ul>
            </Accordion>
          )}
          {!!prequisitesByStatus?.recommended?.length && (
            <Accordion label="Préconisés" defaultExpanded>
              <ul>
                {prequisitesByStatus?.recommended?.map((prerequisite) => (
                  <li key={prerequisite?.id}>{prerequisite?.label}</li>
                ))}
              </ul>
            </Accordion>
          )}
        </div>
      </section>
    </section>
  );
}
