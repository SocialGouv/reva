import Accordion from "@codegouvfr/react-dsfr/Accordion";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { useMemo } from "react";

import {
  Certification,
  CertificationCompetenceDetails,
  DffCertificationCompetenceBloc,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { CertificationCompetenceAccordion } from "./CertificationCompetenceAccordion";

export default function CertificationSection({
  option,
  firstForeignLanguage,
  secondForeignLanguage,
  certification,
  prerequisites,
  blocsDeCompetences,
  certificationCompetenceDetails,
  isCertificationPartial,
  isEligibilityRequirementPartial,
}: {
  option?: string | null;
  firstForeignLanguage?: string | null;
  secondForeignLanguage?: string | null;
  certification?: Certification | null;
  prerequisites?: Prerequisite[] | null;
  blocsDeCompetences?: DffCertificationCompetenceBloc[] | null;
  certificationCompetenceDetails: CertificationCompetenceDetails[];
  isCertificationPartial: boolean;
  isEligibilityRequirementPartial: boolean;
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
      {(firstForeignLanguage || secondForeignLanguage) && (
        <div className="flex gap-2 mb-4">
          {firstForeignLanguage && (
            <div className="flex flex-col flex-1">
              <p className="mb-0">Langue vivante 1 :</p>
              <p className="mb-0 font-medium">{firstForeignLanguage}</p>
            </div>
          )}
          {secondForeignLanguage && (
            <div className="flex flex-col flex-1">
              <p className="mb-0">Langue vivante 2 :</p>
              <p className="mb-0 font-medium">{secondForeignLanguage}</p>
            </div>
          )}
        </div>
      )}
      <CallOut>
        {isCertificationPartial
          ? "Un ou plusieurs bloc(s) de compétences visé(s)"
          : "La certification dans sa totalité"}
      </CallOut>

      <h5 className="mb-0">Blocs de compétences</h5>

      <div className="mb-8 mt-4">
        {blocsDeCompetences?.map((bc) => (
          <CertificationCompetenceAccordion
            key={bc.certificationCompetenceBloc.id}
            defaultExpanded
            competenceBloc={bc.certificationCompetenceBloc}
            competenceBlocText={bc.text}
            competenceDetails={certificationCompetenceDetails}
            hideAccordionContent={isEligibilityRequirementPartial}
          />
        ))}
      </div>
      <h5 className="mb-0">Prérequis obligatoires</h5>
      <div className="mb-8 mt-4">
        {noPrerequisites && (
          <p>
            Il n&apos;y a pas de prérequis obligatoires pour cette certification
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
    </div>
  );
}
