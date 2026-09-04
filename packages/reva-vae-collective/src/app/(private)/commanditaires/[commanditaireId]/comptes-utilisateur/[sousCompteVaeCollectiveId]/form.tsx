"use client";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

export const SousCompteVaeCollectiveForm = ({
  email,
  canCreateCohorteVaeCollective,
}: {
  email: string;
  canCreateCohorteVaeCollective: boolean;
}) => (
  <div className="flex flex-col gap-3">
    <hr className="pb-1" />
    <div className="flex justify-between break-all">
      <span>Email de connexion</span>
      <span>{email}</span>
    </div>
    <hr className="pb-1" />
    <ToggleSwitch
      label="Activer la création de cohorte par ce collaborateur"
      labelPosition="left"
      checked={canCreateCohorteVaeCollective}
      onChange={() => {}}
      disabled
    />
    <hr className="pb-1" />
  </div>
);
