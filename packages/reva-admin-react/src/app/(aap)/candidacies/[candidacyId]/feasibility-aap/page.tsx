"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import {
  BadgeCompleted,
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { CompetenceBlocsPartCompletion } from "@/graphql/generated/graphql";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { certification, dematerializedFeasibilityFile, queryStatus } =
    useAapFeasibilityPageLogic();

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>
      <p>
        Remplissez toutes les catégories afin de pouvoir envoyer le dossier au
        certificateur.
      </p>
      {queryStatus === "success" && (
        <ul className="flex flex-col gap-8">
          <DefaultCandidacySectionCard
            title="Descriptif de la certification"
            titleIconClass="fr-icon-award-fill"
            status={
              dematerializedFeasibilityFile?.certificationPartComplete
                ? "COMPLETED"
                : "TO_COMPLETE"
            }
            buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/certification`}
          >
            <p className="text-xl font-bold mb-2">{certification?.label}</p>
            <p className="text-xs mb-0 text-dsfr-light-text-mention-grey">
              RNCP {certification?.codeRncp}
            </p>
          </DefaultCandidacySectionCard>
          <CandidacySectionCard
            title="Blocs de compétences"
            titleIconClass="fr-icon-survey-fill"
            badge={
              <CompetencesSectionBadge
                completion={
                  dematerializedFeasibilityFile?.competenceBlocsPartCompletion ||
                  "TO_COMPLETE"
                }
              />
            }
          >
            <ul className="list-none flex flex-col gap-2">
              {dematerializedFeasibilityFile?.blocsDeCompetences?.map((bc) => (
                <li key={bc.id} className="flex flex-grow items-center">
                  <span>{bc.code ? `${bc.code} - ${bc.label}` : bc.label}</span>
                  <Button
                    className="ml-auto"
                    linkProps={{
                      href: `/candidacies/${candidacyId}/feasibility-aap/competencies-blocks/${bc.id}`,
                    }}
                  >
                    Compléter
                  </Button>
                </li>
              ))}
            </ul>
          </CandidacySectionCard>
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;

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
