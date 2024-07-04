import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import {
  BadgeCompleted,
  BadgeToComplete,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import {
  CertificationCompetenceDetails,
  CompetenceBlocsPartCompletion,
  DffCertificationCompetenceBloc,
} from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";
import { CertificationCompetenceAccordion } from "./DffSummary/_components/CertificationCompetenceAccordion";

const CompetencesSectionBadge = ({
  completion,
}: {
  completion: CompetenceBlocsPartCompletion;
}) => {
  switch (completion) {
    case "COMPLETED":
      return <BadgeCompleted />;
    case "IN_PROGRESS":
      return <Badge severity="info">En cours</Badge>;
    default:
      return <BadgeToComplete />;
  }
};

export const CompetenciesBlocksSection = ({
  competenceBlocsPartCompletion,
  certificationCompetenceDetails,
  blocsDeCompetences,
}: {
  competenceBlocsPartCompletion?: CompetenceBlocsPartCompletion;
  certificationCompetenceDetails: CertificationCompetenceDetails[];
  blocsDeCompetences: DffCertificationCompetenceBloc[];
}) => {
  const { candidacyId } = useParams();

  return (
    <CandidacySectionCard
      title="Blocs de compétences"
      titleIconClass="fr-icon-survey-fill"
      badge={
        <CompetencesSectionBadge
          completion={competenceBlocsPartCompletion || "TO_COMPLETE"}
        />
      }
    >
      <ul className="list-none flex flex-col">
        {blocsDeCompetences?.map((bloc) => (
          <li
            key={bloc.certificationCompetenceBloc.id}
            className="flex justify-between items-start pb-0 gap-6"
          >
            <CertificationCompetenceAccordion
              key={bloc.certificationCompetenceBloc.id}
              competenceBloc={bloc.certificationCompetenceBloc}
              competenceDetails={certificationCompetenceDetails}
            />
            <Button
              className="w-[120px] mt-4 flex-none"
              priority={bloc.complete ? "secondary" : "primary"}
              linkProps={{
                href: `/candidacies/${candidacyId}/feasibility-aap/competencies-blocks/${bloc.certificationCompetenceBloc.id}`,
              }}
            >
              <span className="mx-auto">
                {bloc.complete ? "Modifier" : "Compléter"}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </CandidacySectionCard>
  );
};
