"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useKeycloakContext } from "../auth/keycloakContext";

export const Header = () => {
  const { logout, authenticated } = useKeycloakContext();

  return (
    <DsfrHeader
      brandTop={
        <>
          République
          <br />
          française
        </>
      }
      homeLinkProps={{
        href: "/../",
        title: "Accueil - France VAE",
      }}
      quickAccessItems={
        authenticated
          ? [
              {
                buttonProps: {
                  onClick: () => logout(),
                  className: "!text-sm !px-3 !py-1 !mb-4 !mx-1",
                },
                iconId: "ri-logout-box-r-line",
                text: "Se déconnecter",
              },
            ]
          : []
      }
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
    />
  );
};
