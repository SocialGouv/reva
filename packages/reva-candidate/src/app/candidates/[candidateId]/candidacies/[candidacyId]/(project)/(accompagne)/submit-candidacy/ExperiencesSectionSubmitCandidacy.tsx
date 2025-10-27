import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { format } from "date-fns";

import { ExperiencesUseSubmitCandidacyForDashboard } from "./submit-candidacy-dashboard.hook";

const durationLabel = {
  betweenOneAndThreeYears: "entre 1 et 3 ans",
  lessThanOneYear: "moins de 1 an",
  moreThanFiveYears: "plus de 5 ans",
  moreThanTenYears: "plus de 10 ans",
  moreThanThreeYears: "plus de 3 ans",
  unknown: "inconnue",
};

export default function ExperiencesSectionSubmitCandidacy({
  experiences,
}: {
  experiences: ExperiencesUseSubmitCandidacyForDashboard;
}) {
  return (
    <div className="mt-10">
      <div className="flex">
        <span className="fr-icon-briefcase-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Expériences professionnelles</h2>
      </div>
      {experiences.length > 0 && (
        <div className="mt-6 pl-10">
          {experiences.map((experience, index) => (
            <Accordion
              key={experience.id}
              label={`Expérience ${index + 1} - ${experience.title}`}
              defaultExpanded
            >
              <p>Démarrée le {format(experience?.startedAt, "dd MMMM yyyy")}</p>
              <p>Expérience {durationLabel[experience?.duration]}</p>
              <p>{experience?.description}</p>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}
