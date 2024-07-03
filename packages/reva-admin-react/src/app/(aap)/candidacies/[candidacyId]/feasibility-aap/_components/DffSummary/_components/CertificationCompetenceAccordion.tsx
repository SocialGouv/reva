import {
  CertificationCompetence,
  CertificationCompetenceBloc,
  CertificationCompetenceDetails,
} from "@/graphql/generated/graphql";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

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
        <p key={competence.id}>
          <span className="font-bold">{competence.label} :</span>
          <br />
          <span>
            {getTextFromCompetence({
              competence,
              competenceDetails,
            })}
          </span>
        </p>
      ))}
    </Accordion>
  );
};
