import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

export const AdminToggleGestionBranch = ({
  className,
  gestionBranchIsChecked,
  setGestionBranch,
}: {
  className?: string;
  gestionBranchIsChecked: boolean;
  setGestionBranch: (value: boolean) => void;
}) => (
  <ToggleSwitch
    className={className}
    helperText="L'activation des branches pour un AAP, vous permettra de choisir pour chaque accompagnement (distanciel et lieux d'accueil) les branches gérées."
    inputTitle="Gestion des branches"
    label="Gestion des branches"
    labelPosition="left"
    checked={gestionBranchIsChecked}
    onChange={setGestionBranch}
  />
);
