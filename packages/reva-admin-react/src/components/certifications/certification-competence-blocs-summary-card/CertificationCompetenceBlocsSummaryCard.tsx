import { SectionCard } from "@/components/card/section-card/SectionCard";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const CertificationCompetenceBlocsSummaryCard = ({
  isEditable,
  competenceBlocs,
  onAddBlocCompetenceButtonClick,
  onUpdateCompetenceBlocButtonClick,
}: {
  isEditable: boolean;
  competenceBlocs: {
    id: string;
    code?: string | null;
    label: string;
    competences: { id: string; label: string }[];
  }[];
  onAddBlocCompetenceButtonClick: () => void;
  onUpdateCompetenceBlocButtonClick: (blocId: string) => void;
}) => (
  <SectionCard
    title="Blocs de compétences"
    data-test="competence-blocs-summary-card"
    titleIconClass="fr-icon-survey-fill"
    {...(() =>
      isEditable
        ? {
            hasButton: true,
            buttonPriority: "tertiary no outline",
            buttonTitle: "Ajouter un bloc de compétences",
            buttonIconId: "fr-icon-add-line",
            buttonOnClick: onAddBlocCompetenceButtonClick,
          }
        : { hasButton: false })()}
  >
    <p>
      La modification de bloc est possible, mais doit rester exceptionnelle.
      Merci de l’utiliser uniquement en cas d’erreur importante à modifier
      (exemple : erreur sur l’intitulé).
    </p>

    <ul className="pl-0" data-test="competence-blocs-list">
      {competenceBlocs.map((bloc) => (
        <li
          data-test="competence-bloc"
          className="flex items-start justify-between gap-6"
          key={bloc.id}
        >
          <Accordion
            className="flex-1"
            label={bloc.code ? `${bloc.code} - ${bloc.label}` : bloc.label}
            defaultExpanded
          >
            <ul data-test="competences-list">
              {bloc.competences.map((competence) => (
                <li key={competence.id}>{competence.label}</li>
              ))}
            </ul>
          </Accordion>
          {isEditable && (
            <Button
              data-test="update-competence-bloc-button"
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
