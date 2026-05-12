import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

const modal = createModal({
  id: "confirm-disable",
  isOpenedByDefault: false,
});

export const DeleteLieuAccueilTile = ({
  lieuAccueilLabel,
  onDeleteLieuAccueilConfirmation,
}: {
  lieuAccueilLabel: string;
  onDeleteLieuAccueilConfirmation: () => void;
}) => (
  <>
    <Tile
      title="Supprimer le lieu d’accueil"
      desc="Ce lieu sera totalement supprimé de votre espace. Si vous souhaitez simplement le masquer dans les recherches, utilisez l'option de disponibilité ci-dessus."
      detail={
        <>
          <span
            className="fr-icon-warning-fill fr-icon--sm mr-2"
            aria-hidden="true"
          />
          <span>La suppression d’un lieu d’accueil est irréversible.</span>
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
          Supprimer un lieu d’accueil
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
          onClick: onDeleteLieuAccueilConfirmation,
          children: "Supprimer",
        },
      ]}
    >
      <p>
        Vous êtes sur le point de supprimer le lieu d’accueil suivant :{" "}
        {lieuAccueilLabel}
      </p>
      <p>Ce lieu d’accueil n’a pas de candidature associée.</p>
      <p>
        La suppression du lieu d’accueil supprimera toutes les données relatives
        à celui-ci. Si vous souhaitez le réactiver plus tard, vous devrez le
        recréer.
      </p>
    </modal.Component>
  </>
);
