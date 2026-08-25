import Badge from "@codegouvfr/react-dsfr/Badge";

import { InfoRow } from "./InfoRow";

export const pendingIfChanged = (current: string, pending?: string | null) =>
  pending && pending !== current ? pending : undefined;

const fullName = (firstname?: string | null, lastname?: string | null) =>
  `${firstname ?? ""} ${lastname ?? ""}`.trim();

type CurrentValues = {
  phone?: string | null;
  managerFirstname?: string | null;
  managerLastname?: string | null;
  gestionnaire: {
    firstname?: string | null;
    lastname?: string | null;
    email: string;
  };
};

type PendingValues = {
  managerFirstname?: string | null;
  managerLastname?: string | null;
  gestionnaireFirstname?: string | null;
  gestionnaireLastname?: string | null;
  gestionnaireEmail?: string | null;
  phone?: string | null;
};

export const AccountInfoRows = ({
  maisonMereAAP,
  pendingValues,
  emphasis,
  badgeLabel,
  gestionnaireEmailAlreadyUsed,
}: {
  maisonMereAAP: CurrentValues;
  pendingValues?: PendingValues | null;
  emphasis: "current" | "pending";
  badgeLabel: string;
  gestionnaireEmailAlreadyUsed?: boolean;
}) => {
  const managerName = fullName(
    maisonMereAAP.managerFirstname,
    maisonMereAAP.managerLastname,
  );
  const gestionnaireName = fullName(
    maisonMereAAP.gestionnaire.firstname,
    maisonMereAAP.gestionnaire.lastname,
  );
  const phone = maisonMereAAP.phone ?? "";

  const rows = [
    {
      label: "Dirigeant(e)",
      currentValue: managerName,
      pendingValue: pendingIfChanged(
        managerName,
        pendingValues &&
          fullName(
            pendingValues.managerFirstname,
            pendingValues.managerLastname,
          ),
      ),
    },
    {
      label: "Administrateur",
      currentValue: gestionnaireName,
      pendingValue: pendingIfChanged(
        gestionnaireName,
        pendingValues &&
          fullName(
            pendingValues.gestionnaireFirstname,
            pendingValues.gestionnaireLastname,
          ),
      ),
    },
    {
      label: "Adresse électronique de connexion",
      currentValue: maisonMereAAP.gestionnaire.email,
      pendingValue: pendingIfChanged(
        maisonMereAAP.gestionnaire.email,
        pendingValues?.gestionnaireEmail,
      ),
      alreadyUsed: gestionnaireEmailAlreadyUsed,
    },
    {
      label: "Téléphone",
      currentValue: phone,
      pendingValue: pendingIfChanged(phone, pendingValues?.phone),
    },
  ];

  return (
    <div>
      <h2>Dirigeant et administrateur du compte</h2>
      {rows.map(({ label, currentValue, pendingValue, alreadyUsed }, index) => (
        <InfoRow
          key={label}
          label={label}
          className={index === 0 ? "border-t" : undefined}
          badge={
            (pendingValue || alreadyUsed) && (
              <>
                {pendingValue && (
                  <Badge severity="info" small>
                    {badgeLabel}
                  </Badge>
                )}
                {alreadyUsed && (
                  <Badge severity="warning" small>
                    Déjà enregistrée sur France VAE
                  </Badge>
                )}
              </>
            )
          }
          pendingValue={pendingValue}
          emphasis={emphasis}
        >
          {currentValue}
        </InfoRow>
      ))}
    </div>
  );
};
