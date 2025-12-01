"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { toDate } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import CandidaciesEmptyState from "./__components/CandidaciesEmptyState";
import { useCandidacies } from "./candidacies.hook";

export default function CandidaciesPage() {
  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  const { candidate, isLoading } = useCandidacies(candidateId);

  const router = useRouter();

  const candidacies = useMemo(() => candidate?.candidacies || [], [candidate]);

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (candidacies.length === 0) {
    return <CandidaciesEmptyState />;
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
            vaeCollective={!!candidacy.cohorteVaeCollective}
            vaeCollectiveCommanditaireLabel={
              candidacy.cohorteVaeCollective?.commanditaireVaeCollective
                .raisonSociale
            }
            vaeCollectiveCohortLabel={candidacy.cohorteVaeCollective?.nom}
            typeAccompagnement={candidacy.typeAccompagnement}
            status={candidacy.status}
            statusHistory={candidacy.candidacyStatuses}
            firstAppointmentOccuredAt={
              candidacy.firstAppointmentOccuredAt
                ? toDate(candidacy.firstAppointmentOccuredAt)
                : undefined
            }
            feasibility={candidacy.feasibility}
            readyForJuryEstimatedAt={
              candidacy.readyForJuryEstimatedAt
                ? toDate(candidacy.readyForJuryEstimatedAt)
                : undefined
            }
            jury={candidacy.jury}
            dropout={candidacy.candidacyDropOut}
          />
        ))}
      </div>
    </div>
  );
}
