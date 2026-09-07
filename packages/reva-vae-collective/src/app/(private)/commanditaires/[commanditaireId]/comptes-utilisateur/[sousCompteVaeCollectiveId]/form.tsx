"use client";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

import { updateSousCompteVaeCollective } from "./actions";

export const SousCompteVaeCollectiveForm = ({
  commanditaireId,
  sousCompteVaeCollectiveId,
  email,
  canCreateCohorteVaeCollective,
}: {
  commanditaireId: string;
  sousCompteVaeCollectiveId: string;
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
      onChange={() =>
        updateSousCompteVaeCollective({
          commanditaireVaeCollectiveId: commanditaireId,
          sousCompteVaeCollectiveId,
          canCreateCohorteVaeCollective: !canCreateCohorteVaeCollective,
        })
      }
    />
    <hr className="pb-1" />
  </div>
);
