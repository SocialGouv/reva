"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { toDate } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidaciesGuard } from "./candidacies.hook";

export default function CandidaciesPage() {
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

  if (!isMultiCandidacyFeatureActive) {
    if (isLoading || candidacies.length > 0) {
      return <LoaderWithLayout />;
    }
  }

  if (candidacies.length === 0) {
    return <div>Vous n'avez pas de candidatures</div>;
  }

  return (
    <div>
      <h1>Mes candidatures et parcours</h1>

      <p>
        Voici la liste de vos candidatures France VAE. Sélectionnez celle de
        votre choix pour suivre son évolution et accomplir les prochaines étapes
        de votre parcours.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-end">
          <Button
            iconId="fr-icon-file-add-line"
            onClick={() => {
              router.push("./create");
            }}
            priority="secondary"
          >
            Créer une candidature
          </Button>
        </div>

        {candidacies.map((candidacy) => (
          <CandidacyCard
            key={candidacy.id}
            typeAccompagnement={candidacy.typeAccompagnement}
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
    </div>
  );
}
