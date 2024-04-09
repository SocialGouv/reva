"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import {
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useRouter } from "next/navigation";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const { certification, dematerializedFeasibilityFile } =
    useAapFeasibilityPageLogic();

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>
      <p>
        Remplissez toutes les catégories afin de pouvoir envoyer le dossier au
        certificateur.
      </p>
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
          badge={<BadgeToComplete />}
        >
          {dematerializedFeasibilityFile && (
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
          )}
        </CandidacySectionCard>
      </ul>
    </div>
  );
};

export default AapFeasibilityPage;
