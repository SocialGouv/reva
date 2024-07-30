import {
  CertificationCompetence,
  CertificationCompetenceBloc,
  CertificationCompetenceDetails,
  DffCertificationCompetenceDetailsState,
} from "@/graphql/generated/graphql";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";

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

export const CertificationCompetenceAccordion = ({
  competenceBloc,
  competenceDetails,
  defaultExpanded = false,
}: {
  competenceBloc: CertificationCompetenceBloc;
  competenceDetails: CertificationCompetenceDetails[];
  defaultExpanded?: boolean;
}) => {
  const label = competenceBloc.code
    ? `${competenceBloc.code} - ${competenceBloc.label}`
    : competenceBloc.label;

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
