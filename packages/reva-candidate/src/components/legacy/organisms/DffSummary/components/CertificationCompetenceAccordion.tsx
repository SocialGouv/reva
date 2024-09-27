import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";

import {
  CertificationCompetence,
  CertificationCompetenceBloc,
  CertificationCompetenceDetails,
  DffCertificationCompetenceDetailsState,
} from "@/graphql/generated/graphql";

const getTextFromCompetence = ({
  competence,
  competenceDetails,
}: {
  competence: CertificationCompetence;
  competenceDetails: CertificationCompetenceDetails[];
}): string => {
  return (
    competenceDetails.find(
      (detail) => detail.certificationCompetence.id === competence.id,
    )?.text || ""
  );
};

const getStateFromCompetence = ({
  competence,
  competenceDetails,
}: {
  competence: CertificationCompetence;
  competenceDetails: CertificationCompetenceDetails[];
}): DffCertificationCompetenceDetailsState => {
  return (
    competenceDetails.find(
      (detail) => detail.certificationCompetence.id === competence.id,
    )?.state || "YES"
  );
};

const BadgeState = ({
  state,
}: {
  state: DffCertificationCompetenceDetailsState;
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

  return null;
};

const CertificationCompetenceRow = ({
  label,
  isFirstRow,
}: {
  label: string;
  isFirstRow: boolean;
}) => (
  <div
    className={`px-4 py-3 text-dsfrBlue-500 font-medium border-b-[1px] border-neutral-200 ${isFirstRow ? "border-t-[1px]" : ""}`}
  >
    {label}
  </div>
);

export const CertificationCompetenceAccordion = ({
  competenceBloc,
  competenceDetails,
  isFirstRow,
  defaultExpanded = false,
  hideAccordionContent = false,
}: {
  competenceBloc: CertificationCompetenceBloc;
  competenceDetails: CertificationCompetenceDetails[];
  isFirstRow: boolean;
  defaultExpanded?: boolean;
  hideAccordionContent?: boolean;
}) => {
  const label = competenceBloc.code
    ? `${competenceBloc.code} - ${competenceBloc.label}`
    : competenceBloc.label;

  if (hideAccordionContent) {
    return <CertificationCompetenceRow label={label} isFirstRow={isFirstRow} />;
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
            <span className="font-bold">{competence.label} :</span>
            <br />
            <span>
              {getTextFromCompetence({
                competence,
                competenceDetails,
              })}
            </span>
          </p>
        </div>
      ))}
    </Accordion>
  );
};
