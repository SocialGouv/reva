import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { SectionCard } from "@/components/card/section-card/SectionCard";

type CompetenceBloc = {
  id: string;
  code?: string | null;
  label: string;
  competences: { id: string; label: string }[];
};

export const CertificationCompetenceBlocsSummaryCard = ({
  isEditable,
  competenceBlocs,
  onAddBlocCompetenceButtonClick,
  onUpdateCompetenceBlocButtonClick,
}:
  | {
      isEditable: true;
      competenceBlocs: CompetenceBloc[];
      onAddBlocCompetenceButtonClick?: () => void;
      onUpdateCompetenceBlocButtonClick: (blocId: string) => void;
    }
  | {
      isEditable: false;
      competenceBlocs: CompetenceBloc[];
      onAddBlocCompetenceButtonClick?: () => void;
      onUpdateCompetenceBlocButtonClick?: (blocId: string) => void;
    }) => (
  <SectionCard
    title="Blocs de compétences"
    data-testid="competence-blocs-summary-card"
    titleIconClass="fr-icon-survey-fill"
    {...(() =>
      isEditable && onAddBlocCompetenceButtonClick
        ? {
            hasButton: true,
            buttonPriority: "tertiary no outline",
            buttonTitle: "Ajouter un bloc de compétences",
            buttonIconId: "fr-icon-add-line",
            buttonOnClick: onAddBlocCompetenceButtonClick,
          }
        : { hasButton: false })()}
  >
    {isEditable && (
      <p>
        La modification de bloc est possible, mais doit rester exceptionnelle.
        Merci de l’utiliser uniquement en cas d’erreur importante à modifier
        (exemple : erreur sur l’intitulé).
      </p>
    )}

    <ul className="pl-0" data-testid="competence-blocs-list">
      {competenceBlocs.map((bloc) => (
        <li
          data-testid="competence-bloc"
          className="flex items-start justify-between gap-6 border-b border-dsfr-light-decisions-border-border-default-grey"
          key={bloc.id}
        >
          <Accordion
            className="flex-1 before:shadow-none"
            label={bloc.code ? `${bloc.code} - ${bloc.label}` : bloc.label}
            defaultExpanded
          >
            <ul data-testid="competences-list">
              {bloc.competences.map((competence) => (
                <li key={competence.id}>{competence.label}</li>
              ))}
            </ul>
          </Accordion>
          {isEditable && (
            <Button
              data-testid="update-competence-bloc-button"
              priority="tertiary no outline"
              onClick={() => onUpdateCompetenceBlocButtonClick(bloc.id)}
            >
              Modifier
            </Button>
          )}
        </li>
      ))}
    </ul>
  </SectionCard>
);
