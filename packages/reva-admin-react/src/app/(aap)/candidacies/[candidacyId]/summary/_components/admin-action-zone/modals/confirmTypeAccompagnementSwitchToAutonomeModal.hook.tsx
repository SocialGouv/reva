import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const useConfirmTypeAccompagnementSwitchToAutonomeModal = () => {
  const confirmTypeAccompagnementSwitchToAutonomeModal = createModal({
    id: "confirm-type-accompagnement-switch-to-autonome",
    isOpenedByDefault: false,
  });

  const ConfirmTypeAccompagnementSwitchToAutonomeModal = ({
    onConfirmButtonClick,
  }: {
    onConfirmButtonClick: () => void;
  }) => (
    <confirmTypeAccompagnementSwitchToAutonomeModal.Component
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
      <div className="flex flex-col">
        <p>
          Passer ce candidat en parcours autonome est une action définitive.
          Cela supprimera certains éléments de son espace personnel :
        </p>
        <ul className="mb-6">
          <li>Objectifs</li>
          <li>Expériences</li>
          <li>Choix de l’accompagnateur</li>
        </ul>
        <p>
          Si une décision a déjà été prise sur le dossier de faisabilité, elle
          restera accessible dans la section concernée, sous le même format.
        </p>
        <p className="mb-0">Êtes vous sûr de vouloir continuer ?</p>
      </div>
    </confirmTypeAccompagnementSwitchToAutonomeModal.Component>
  );
  return {
    Component: ConfirmTypeAccompagnementSwitchToAutonomeModal,
    open: confirmTypeAccompagnementSwitchToAutonomeModal.open,
  };
};
