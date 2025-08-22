import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";

import {
  CertificationCompetence,
  CertificationCompetenceBloc,
  CertificationCompetenceDetails,
  DffCertificationCompetenceDetailsState,
} from "@/graphql/generated/graphql";

const getStateFromCompetence = ({
  competence,
  competenceDetails,
}: {
  competence: CertificationCompetence;
  competenceDetails: CertificationCompetenceDetails[];
}): DffCertificationCompetenceDetailsState | "TO_COMPLETE" => {
  return (
    competenceDetails.find(
      (detail) => detail.certificationCompetence.id === competence.id,
    )?.state || "TO_COMPLETE"
  );
};

const BadgeState = ({
  state,
}: {
  state: DffCertificationCompetenceDetailsState | "TO_COMPLETE";
}) => {
  if (state === "YES") {
    return (
      <Badge noIcon severity="success" small>
        Oui
      </Badge>
    );
  }
  if (state === "NO") {
    return (
      <Badge severity="error" noIcon small>
        Non
      </Badge>
    );
  }
  if (state === "PARTIALLY") {
    return (
      <Badge severity="new" noIcon small>
        Partiellement
      </Badge>
    );
  }

  if (state === "TO_COMPLETE") {
    return (
      <Badge severity="warning" noIcon small>
        À compléter
      </Badge>
    );
  }

  return null;
};

const CertificationCompetenceRow = ({ label }: { label: string }) => (
  <div
    className={`px-4 py-3 text-dsfr-blue-france-sun-113 font-medium border-b-[1px] border-neutral-200`}
  >
    {label}
  </div>
);

export const CertificationCompetenceAccordion = ({
  competenceBloc,
  competenceBlocText,
  competenceDetails,
  defaultExpanded = false,
  hideAccordionContent = false,
}: {
  competenceBloc: CertificationCompetenceBloc;
  competenceBlocText?: string | null;
  competenceDetails: CertificationCompetenceDetails[];
  defaultExpanded?: boolean;
  hideAccordionContent?: boolean;
}) => {
  const label = competenceBloc.code
    ? `${competenceBloc.code} - ${competenceBloc.label}`
    : competenceBloc.label;

  if (hideAccordionContent) {
    return <CertificationCompetenceRow label={label} />;
  }

  return (
    <Accordion label={label} defaultExpanded={defaultExpanded}>
      {competenceBloc.competences.map((competence) => (
        <div key={competence.id}>
          <BadgeState
            state={getStateFromCompetence({
              competence,
              competenceDetails,
            })}
          />
          <p>
            <span className="font-bold">{competence.label}</span>
          </p>
        </div>
      ))}
      {!!competenceBlocText && <p>{competenceBlocText}</p>}
    </Accordion>
  );
};
