import { SectionCard } from "@/components/card/section-card/SectionCard";
// import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
// import { Button } from "@codegouvfr/react-dsfr/Button";

export const CertificationActivitiesSummaryCard = ({
  // isEditable,
  activities,
  // competenceBlocs,
  // onAddBlocCompetenceButtonClick,
  // onUpdateCompetenceBlocButtonClick,
}: {
  // isEditable: boolean;
  activities?: string[];
  // competenceBlocs: {
  //   id: string;
  //   code?: string | null;
  //   label: string;
  //   competences: { id: string; label: string }[];
  // }[];
  // onAddBlocCompetenceButtonClick?: () => void;
  // onUpdateCompetenceBlocButtonClick: (blocId: string) => void;
}) => (
  <SectionCard
    title="Activités"
    data-test="activities-summary-card"
    titleIconClass="fr-icon-survey-fill"
    // {...(() =>
    //   isEditable && onAddBlocCompetenceButtonClick
    //     ? {
    //         hasButton: true,
    //         buttonPriority: "tertiary no outline",
    //         buttonTitle: "Ajouter un bloc de compétences",
    //         buttonIconId: "fr-icon-add-line",
    //         buttonOnClick: onAddBlocCompetenceButtonClick,
    //       }
    //     : { hasButton: false })()}
  >
    <p>
      La modification est possible, mais doit rester exceptionnelle. Merci de
      l’utiliser uniquement en cas d’erreur importante à modifier (exemple :
      erreur sur l’intitulé).
    </p>

    <ul className="pl-0 flex flex-col gap-2" data-test="competence-blocs-list">
      {activities?.map((activity) => (
        <li
          data-test="activity"
          className="flex fl items-start justify-between gap-6"
          key={activity}
        >
          {activity}
        </li>
      ))}
    </ul>
  </SectionCard>
);
