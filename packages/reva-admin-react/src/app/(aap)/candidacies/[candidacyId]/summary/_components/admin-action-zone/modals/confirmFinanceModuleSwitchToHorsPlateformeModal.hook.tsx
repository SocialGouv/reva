import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const useConfirmFinanceModuleSwitchToHorsPlateformeModal = () => {
  const confirmFinanceModuleSwitchToHorsPlateformeModal = createModal({
    id: "confirm-finance-module-switch-to-hors-plateforme",
    isOpenedByDefault: false,
  });

  const ConfirmFinanceModuleSwitchToHorsPlateformeModal = ({
    onConfirmButtonClick,
  }: {
    onConfirmButtonClick: () => void;
  }) => (
    <confirmFinanceModuleSwitchToHorsPlateformeModal.Component
      title={
        <div className="flex gap-2">
          <span className="fr-icon-warning-fill" />
          Cette action est irréversible
        </div>
      }
      size="large"
      buttons={[
        {
          priority: "secondary",
          children: "Annuler",
        },
        {
          priority: "primary",
          children: "Confirmer",
          onClick: onConfirmButtonClick,
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        <p>
          Vous êtes sur le point de passer ce candidat en parcours hors
          financement. Cette action est définitive et ne pourra pas être
          annulée.
        </p>
        <p className="mb-0">Êtes vous sûr de vouloir continuer ?</p>
      </div>
    </confirmFinanceModuleSwitchToHorsPlateformeModal.Component>
  );

  return {
    Component: ConfirmFinanceModuleSwitchToHorsPlateformeModal,
    open: confirmFinanceModuleSwitchToHorsPlateformeModal.open,
  };
};
