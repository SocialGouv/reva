import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

const modal = createModal({
  id: "confirm-disable",
  isOpenedByDefault: false,
});

export const DisableCompteCollaborateurAAPTile = ({
  onDisableUserAccountConfirmation,
}: {
  onDisableUserAccountConfirmation: () => void;
}) => (
  <>
    <Tile
      title="Désactiver le compte collaborateur"
      desc="Ce collaborateur n’aura plus accès à la plateforme."
      detail={
        <>
          <span
            className="fr-icon-warning-fill fr-icon--sm mr-2"
            aria-hidden="true"
          />
          <span>
            La désactivation d’un compte collaborateur est irréversible.
          </span>
        </>
      }
      small
      enlargeLinkOrButton
      orientation="horizontal"
      buttonProps={{
        onClick: modal.open,
      }}
    />

    <modal.Component
      title={
        <div>
          <span className="fr-icon-warning-fill mr-2" aria-hidden="true"></span>
          Voulez-vous désactiver ce compte collaborateur ?
        </div>
      }
      size="large"
      buttons={[
        {
          priority: "secondary",
          children: "Annuler",
        },
        {
          type: "button",
          priority: "primary",
          onClick: onDisableUserAccountConfirmation,
          children: "Désactiver",
        },
      ]}
    >
      <p>
        Attention, cette action est irréversible. La désactivation de ce
        collaborateur n’impactera pas la visibilité des candidatures.
      </p>
    </modal.Component>
  </>
);
