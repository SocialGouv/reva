import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { BadgeCompleted } from "@/components/badge/badge-completed/BadgeCompleted";
import { BadgeToComplete } from "@/components/badge/badge-to-complete/BadgeToComplete";
import { SectionCard } from "@/components/card/section-card/SectionCard";
import { CertificationCompetenceAccordion } from "@/components/dff-summary/_components/CertificationCompetenceAccordion";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

import {
  CertificationCompetenceDetails,
  CompetenceBlocsPartCompletion,
  DffCertificationCompetenceBloc,
} from "@/graphql/generated/graphql";

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
  isEditable,
  competenceBlocsPartCompletion,
  certificationCompetenceDetails,
  blocsDeCompetences,
  disabled,
  disabledNoticeText,
  isEligibilityRequirementPartial,
}: {
  isEditable: boolean;
  competenceBlocsPartCompletion?: CompetenceBlocsPartCompletion;
  certificationCompetenceDetails: CertificationCompetenceDetails[];
  blocsDeCompetences?: DffCertificationCompetenceBloc[];
  disabled: boolean;
  disabledNoticeText: string;
  isEligibilityRequirementPartial: boolean;
}) => {
  const { candidacyId } = useParams();

  return (
    <SectionCard
      title="Blocs de compétences"
      titleIconClass="fr-icon-survey-fill"
      badge={
        isEditable && (
          <CompetencesSectionBadge
            completion={competenceBlocsPartCompletion || "TO_COMPLETE"}
          />
        )
      }
      disabled={disabled}
      data-testid="competencies-blocks-section"
    >
      {!!blocsDeCompetences?.length && (
        <ul className="list-none flex flex-col gap-2">
          {blocsDeCompetences?.map((bloc) => (
            <li
              key={bloc.certificationCompetenceBloc.id}
              className="flex flex-row justify-between items-start pb-0 gap-6"
            >
              <CertificationCompetenceAccordion
                key={bloc.certificationCompetenceBloc.id}
                competenceBloc={bloc.certificationCompetenceBloc}
                competenceBlocText={bloc.text}
                competenceDetails={certificationCompetenceDetails}
                hideAccordionContent={isEligibilityRequirementPartial}
              />
              {!disabled && isEditable && (
                <Button
                  className="w-[120px] flex-none mt-1 border-t-[1px]"
                  priority={bloc.complete ? "secondary" : "primary"}
                  linkProps={{
                    href: `/candidacies/${candidacyId}/feasibility-aap/competencies-blocks/${bloc.certificationCompetenceBloc.id}`,
                  }}
                  data-testid="competencies-blocks-section-button"
                >
                  <span className="mx-auto">
                    {bloc.complete ? "Modifier" : "Compléter"}
                  </span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {disabled && (
        <SmallNotice className="mt-4">{disabledNoticeText}</SmallNotice>
      )}
    </SectionCard>
  );
};
