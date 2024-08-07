import Accordion from "@codegouvfr/react-dsfr/Accordion";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import {
  Certification,
  CertificationCompetenceBloc,
  CertificationCompetenceDetails,
  Prerequisite,
} from "graphql/generated/graphql";
import { useMemo } from "react";

import { CertificationCompetenceAccordion } from "./CertificationCompetenceAccordion";

export default function CertificationSection({
  option,
  firstForeignLanguage,
  secondForeignLanguage,
  certification,
  prerequisites,
  blocsDeCompetences,
  certificationCompetenceDetails,
}: {
  option?: string | null;
  firstForeignLanguage?: string | null;
  secondForeignLanguage?: string | null;
  certification?: Certification | null;
  prerequisites?: Prerequisite[] | null;
  blocsDeCompetences: CertificationCompetenceBloc[];
  certificationCompetenceDetails: CertificationCompetenceDetails[];
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

  return (
    <div>
      <div className="flex">
        <span className="fr-icon-award-fill fr-icon--lg mr-2" />
        <h2>Certification visée</h2>
      </div>
      <h4 className="mb-2">{certification?.label}</h4>
      <p className="text-sm text-dsfr-light-text-mention-grey">
        RNCP {certification?.codeRncp}
      </p>
      {!!option && (
        <>
          <p className="mb-0">Option ou parcours:</p>
          <p className="font-medium">{option}</p>
        </>
      )}
      <div className="flex gap-2 mb-4">
        <div className="flex flex-col flex-1">
          <p className="mb-0">Langue vivante 1 :</p>
          <p className="mb-0 font-medium">{firstForeignLanguage}</p>
        </div>
        {secondForeignLanguage && (
          <div className="flex flex-col flex-1">
            <p className="mb-0">Langue vivante 2 :</p>
            <p className="mb-0 font-medium">{secondForeignLanguage}</p>
          </div>
        )}
      </div>
      <CallOut>Un ou plusieurs bloc(s) de compétences visé(s)</CallOut>

      <h5 className="mb-0">Blocs de compétences</h5>

      <div className="mb-8 mt-4">
        {blocsDeCompetences.map((certificationCompetenceBloc) => (
          <CertificationCompetenceAccordion
            key={certificationCompetenceBloc.id}
            defaultExpanded
            competenceBloc={certificationCompetenceBloc}
            competenceDetails={certificationCompetenceDetails}
          />
        ))}
      </div>
      <h5 className="mb-0">Prérequis obligatoires</h5>
      <div className="mb-8 mt-4">
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
    </div>
  );
}
