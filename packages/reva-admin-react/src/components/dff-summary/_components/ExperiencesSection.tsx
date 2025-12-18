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
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="mb-0">Expériences professionnelles</h3>
      {experiences.length > 0 && (
        <div className="ml-10">
          {experiences.map((experience, index) => (
            <Accordion
              key={experience.id}
              label={`Expérience ${index + 1} - ${experience.title}`}
              defaultExpanded={false}
              data-testid={`experience-accordion-${index}`}
            >
              <p className="mb-2">
                Démarrée le {format(experience?.startedAt, "dd MMMM yyyy")}
              </p>
              <p className="mb-2">
                Expérience {durationLabel[experience?.duration]}
              </p>
              <p className="mb-2">{experience?.description}</p>
            </Accordion>
          ))}
        </div>
      )}

      {blocsDeCompetences.length > 0 && (
        <>
          <h3 className="mb-0">Blocs de compétences</h3>

          <div className="ml-10">
            {blocsDeCompetences.map((bc) => (
              <CertificationCompetenceAccordion
                key={bc.certificationCompetenceBloc.id}
                defaultExpanded={false}
                competenceBloc={bc.certificationCompetenceBloc}
                competenceBlocText={bc.text}
                competenceDetails={certificationCompetenceDetails}
                hideAccordionContent={isEligibilityRequirementPartial}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
