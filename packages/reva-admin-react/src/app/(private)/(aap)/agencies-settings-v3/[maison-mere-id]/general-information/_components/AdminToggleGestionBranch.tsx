import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

export const AdminToggleGestionBranch = ({
  gestionBranchIsChecked,
  setGestionBranch,
}: {
  gestionBranchIsChecked: boolean;
  setGestionBranch: (value: boolean) => void;
}) => (
  <ToggleSwitch
    helperText="L'activation des branches pour un AAP, vous permettra de choisir pour chaque accompagnement (distanciel et lieux d'accueil) les branches gérées."
    inputTitle="Gestion des branches"
    label="Gestion des branches"
    labelPosition="left"
    checked={gestionBranchIsChecked}
    onChange={setGestionBranch}
  />
);
