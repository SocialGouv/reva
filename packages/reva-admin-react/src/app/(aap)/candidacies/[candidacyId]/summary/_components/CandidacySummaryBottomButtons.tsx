import Button from "@codegouvfr/react-dsfr/Button";
import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";
import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const CandidacySummaryBottomButtons = ({
  candidacyId,
  candidacy,
}: {
  candidacyId: string;
  candidacy: CandidacyForStatus;
}) => {
  const {
    canBeArchived,
    canBeRestored,
    canDroput,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
  } = useCandidacyStatus(candidacy);

  const confirmFinanceModuleSwitchToHorsPlateformeModal = createModal({
    id: "confirm-finance-module-switch-to-hors-plateforme",
    isOpenedByDefault: false,
  });

  return (
    <div className="mt-6 flex flex-col md:flex-row gap-4">
      <confirmFinanceModuleSwitchToHorsPlateformeModal.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-warning-fill" />
            Cette action est irréversible
          </div>
        }
        className="[&_.fr-btn--close]:hidden"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            children: "Confirmer",
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p>
            Le passage en hors financement privera ce candidat de tout prise en
            charge par France VAE. Êtes vous sûr de vouloir continuer ?
          </p>
        </div>
      </confirmFinanceModuleSwitchToHorsPlateformeModal.Component>
      {canBeArchived && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/archive`,
            target: "_self",
          }}
        >
          Supprimer la candidature
        </Button>
      )}
      {canBeRestored && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/unarchive`,
            target: "_self",
          }}
        >
          Restaurer la candidature
        </Button>
      )}
      {canDroput && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        >
          Déclarer l'abandon du candidat
        </Button>
      )}
      {canCancelDropout && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/cancel-drop-out`,
            target: "_self",
          }}
        >
          Annuler l'abandon du candidat
        </Button>
      )}
      {canSwitchFinanceModuleToHorsPlateforme && (
        <Button
          priority="secondary"
          onClick={confirmFinanceModuleSwitchToHorsPlateformeModal.open}
        >
          Passage en hors financement
        </Button>
      )}
    </div>
  );
};
