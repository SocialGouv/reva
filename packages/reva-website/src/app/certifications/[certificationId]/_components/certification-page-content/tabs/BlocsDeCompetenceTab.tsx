import { Accordion } from "@codegouvfr/react-dsfr/Accordion";

export const BlocsDeCompetenceTab = ({
  competenceBlocs,
}: {
  competenceBlocs: {
    id: string;
    code?: string | null;
    label: string;
    competences: {
      id: string;
      label: string;
    }[];
  }[];
}) => (
  <div className="flex flex-col">
    <p>
      Chaque bloc de compétences constitue une partie de votre diplôme qui peut
      être validée indépendamment des autres et reste acquise à vie.
    </p>

    {competenceBlocs.map((competenceBloc) => (
      <Accordion
        key={competenceBloc.id}
        label={
          competenceBloc.code
            ? `${competenceBloc.code} - ${competenceBloc.label}`
            : competenceBloc.label
        }
        defaultExpanded
      >
        {competenceBloc.competences.map((competence) => (
          <p key={competence.id}>{competence.label}</p>
        ))}
      </Accordion>
    ))}
  </div>
);
