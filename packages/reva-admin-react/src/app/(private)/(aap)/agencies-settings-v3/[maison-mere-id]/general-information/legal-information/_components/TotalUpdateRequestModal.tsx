import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const totalUpdateRequestModal = createModal({
  id: "total-update-request",
  isOpenedByDefault: false,
});

export const TotalUpdateRequestModal = ({
  onConfirm,
  disabled,
}: {
  onConfirm: (params: { makeInvisible: boolean }) => void;
  disabled?: boolean;
}) => (
  <totalUpdateRequestModal.Component
    title="Demande de mise à jour totale"
    size="large"
    // doClosesModal: la modale reste ouverte en cas d'échec de l'envoi.
    buttons={[
      {
        priority: "secondary",
        type: "button",
        doClosesModal: false,
        disabled,
        onClick: () => onConfirm({ makeInvisible: true }),
        children: "Invisibiliser",
      },
      {
        priority: "primary",
        type: "button",
        doClosesModal: false,
        disabled,
        onClick: () => onConfirm({ makeInvisible: false }),
        children: "Laisser visible",
      },
    ]}
  >
    <p>
      Vous êtes sur le point de demander une mise à jour des informations
      générales relatives à une structure accompagnatrice.
    </p>
    <p>
      Souhaitez-vous rendre cette structure temporairement invisible pour les
      nouveaux candidats ?
    </p>
    <p>
      Vous pouvez la rendre à nouveau visible, à tout moment, depuis l'annuaire
      des structures accompagnatrices.
    </p>
  </totalUpdateRequestModal.Component>
);
