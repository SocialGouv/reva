import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { format } from "date-fns";

import {
  CertificationCompetenceDetails,
  DffCertificationCompetenceBloc,
  Experience,
} from "@/graphql/generated/graphql";

import { CertificationCompetenceAccordion } from "./CertificationCompetenceAccordion";

export default function ExperiencesSection({
  experiences,
  blocsDeCompetences,
  certificationCompetenceDetails,
  isEligibilityRequirementPartial,
}: {
  experiences: Experience[];
  blocsDeCompetences: DffCertificationCompetenceBloc[];
  certificationCompetenceDetails: CertificationCompetenceDetails[];
  isEligibilityRequirementPartial: boolean;
}) {
  const durationLabel = {
    betweenOneAndThreeYears: "entre 1 et 3 ans",
    lessThanOneYear: "moins de 1 an",
    moreThanFiveYears: "plus de 5 ans",
    moreThanTenYears: "plus de 10 ans",
    moreThanThreeYears: "plus de 3 ans",
    unknown: "inconnue",
  };
  return (
    <div className="my-8">
      <div className="flex">
        <span className="fr-icon-briefcase-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Expériences professionnelles</h2>
      </div>
      {experiences.length > 0 && (
        <div className="mt-4">
          {experiences.map((experience, index) => (
            <Accordion
              key={experience.id}
              label={`Expérience ${index + 1} - ${experience.title}`}
              defaultExpanded
              data-testid={`experience-accordion-${index}`}
            >
              <p>Démarrée le {format(experience?.startedAt, "dd MMMM yyyy")}</p>
              <p>Expérience {durationLabel[experience?.duration]}</p>
              <p>{experience?.description}</p>
            </Accordion>
          ))}
        </div>
      )}

      {blocsDeCompetences.length > 0 && (
        <div className="mt-8">
          <h5 className="mb-0">Blocs de compétences</h5>

          <div className="mt-4">
            {blocsDeCompetences.map((bc) => (
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
        </div>
      )}
    </div>
  );
}
