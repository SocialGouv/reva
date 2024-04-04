"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { certification, dematerializedFeasibilityFile } =
    useAapFeasibilityPageLogic();

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>
      <p>
        Remplissez toutes les catégories afin de pouvoir envoyer le dossier au
        certificateur.
      </p>
      <ul>
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
      </ul>
    </div>
  );
};

export default AapFeasibilityPage;
