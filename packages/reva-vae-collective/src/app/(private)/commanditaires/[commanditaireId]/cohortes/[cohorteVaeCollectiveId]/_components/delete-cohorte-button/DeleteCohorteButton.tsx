"use client";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { deleteCohorte } from "./actions";

const modal = createModal({
  id: "confirm-deletion",
  isOpenedByDefault: false,
});

export const DeleteCohorteButton = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  nomCohorte,
  disabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  nomCohorte: string;
  disabled?: boolean;
}) => {
  const onConfirmButtonClick = () => {
    deleteCohorte({
      commanditaireVaeCollectiveId: commanditaireId,
      cohorteVaeCollectiveId,
    });
  };

  return (
    <>
      <modal.Component
        iconId="fr-icon-warning-fill"
        title={
          <span className="ml-2">
            La suppression d’une cohorte est irreversible.
          </span>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            onClick: onConfirmButtonClick,
            children: "Supprimer",
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p>Vous allez supprimer la cohorte {nomCohorte}.</p>
          <p>Souhaitez-vous supprimer cette cohorte ?</p>
        </div>
      </modal.Component>
      <Tile
        title="Supprimer cette cohorte"
        small
        enlargeLinkOrButton
        orientation="horizontal"
        detail="La suppression d’une cohorte est irréversible."
        buttonProps={{
          onClick: () => modal.open(),
        }}
        disabled={disabled}
      />
    </>
  );
};
