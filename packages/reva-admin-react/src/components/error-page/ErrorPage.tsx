"use client";

import { EmptyState } from "@/components/empty-state/EmptyState";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export const ErrorPage = () => (
  <EmptyState
    data-testid="error-page"
    title="Une erreur inattendue est survenue"
    pictogram={PICTOGRAMS.technicalErrorLG}
    orientation="horizontal"
  >
    <p className="fr-text--lead">
      Le service rencontre un problème. Nous travaillons pour le résoudre le
      plus rapidement possible.
    </p>
    <p className="text-sm leading-6 mb-0">
      Si le problème persiste, contactez le support à{" "}
      <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>
    </p>
  </EmptyState>
);
