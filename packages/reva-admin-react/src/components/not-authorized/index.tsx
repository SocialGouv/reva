import { EmptyState } from "@/components/empty-state/EmptyState";

import { PICTOGRAMS } from "../pictograms/Pictograms";

export const NotAuthorized = () => {
  return (
    <EmptyState
      data-testid="not-authorized"
      title="Accès restreint"
      pictogram={PICTOGRAMS.padlockXL}
      orientation="horizontal"
    >
      <p className="text-sm text-gray-600">Erreur 403</p>
      <p className="fr-text--lead">
        Vous ne disposez pas des droits nécessaires pour consulter cette page.
      </p>
      <p className="text-sm leading-6 mb-0">
        Il semble que votre compte n’ait pas les autorisations requises pour
        accéder à ce contenu. Si vous pensez qu’il s’agit d’une erreur ou que
        vous avez besoin d’un accès, vous pouvez contacter le support FVAE à{" "}
        <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>
      </p>
    </EmptyState>
  );
};
