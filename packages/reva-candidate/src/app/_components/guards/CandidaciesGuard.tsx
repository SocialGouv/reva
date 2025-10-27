import { toDate } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import {
  CandidacyForCandidaciesGuard,
  useCandidaciesGuard,
} from "./CandidaciesGuard.hook";

export const CandidaciesGuard = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { candidate, isLoading } = useCandidaciesGuard();

  const router = useRouter();

  const candidacies = useMemo(() => candidate?.candidacies || [], [candidate]);

  const { isFeatureActive } = useFeatureFlipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  useEffect(() => {
    if (isMultiCandidacyFeatureActive) {
      return;
    }

    if (candidacies.length > 0) {
      router.push(`./${candidacies[0].id}`);
    }
  }, [candidacies, isMultiCandidacyFeatureActive, router]);

  if (isMultiCandidacyFeatureActive) {
    return <SelectCandidacy candidacies={candidacies} />;
  }

  if (!isMultiCandidacyFeatureActive) {
    if (isLoading || candidacies.length > 0) {
      return <LoaderWithLayout />;
    }

    if (candidacies.length === 0) {
      return <div>No candidacies</div>;
    }
  }

  return children;
};

const SelectCandidacy = ({
  candidacies,
}: {
  candidacies: CandidacyForCandidaciesGuard[];
}) => {
  if (candidacies.length === 0) {
    return <div>No candidacies</div>;
  }

  return (
    <div>
      <h1>Mes candidatures et parcours</h1>

      <p>
        Voici la liste de vos candidatures France VAE. Sélectionnez celle de
        votre choix pour suivre son évolution et accomplir les prochaines étapes
        de votre parcours.
      </p>

      {candidacies.map((candidacy) => (
        <CandidacyCard
          key={candidacy.id}
          candidacyId={candidacy.id}
          certificationLabel={
            candidacy.certification
              ? `RNCP ${candidacy?.certification.codeRncp} : ${candidacy?.certification?.label}`
              : undefined
          }
          organismLabel={
            candidacy.organism?.nomPublic || candidacy.organism?.label
          }
          organismModalitateAccompagnement={
            candidacy.organism?.modaliteAccompagnement
          }
          candidacySentAt={
            candidacy.candidacyStatuses.some((s) => s.status === "VALIDATION")
              ? toDate(
                  candidacy.candidacyStatuses.find(
                    (s) => s.status === "VALIDATION",
                  )?.createdAt || 0,
                )
              : undefined
          }
          fundable={candidacy.financeModule !== "hors_plateforme"}
          vaeCollective={!!candidacy.cohorteVaeCollective}
          vaeCollectiveCommanditaireLabel={
            candidacy.cohorteVaeCollective?.commanditaireVaeCollective
              .raisonSociale
          }
          vaeCollectiveCohortLabel={candidacy.cohorteVaeCollective?.nom}
          status={candidacy.status}
          feasibility={candidacy.feasibility}
          jury={candidacy.jury}
          dropout={candidacy.candidacyDropOut}
        />
      ))}
    </div>
  );
};
