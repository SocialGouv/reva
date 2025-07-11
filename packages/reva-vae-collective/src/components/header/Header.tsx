"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useKeycloakContext } from "../auth/keycloakContext";
import { ComponentProps } from "react";

export const Header = () => {
  const { logout, authenticated } = useKeycloakContext();

  type QuickAccessItem = NonNullable<
    ComponentProps<typeof DsfrHeader>["quickAccessItems"]
  >[number];

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
        href: "/",
        title: "Accueil - France VAE",
      }}
      quickAccessItems={
        authenticated
          ? ([
              {
                linkProps: {
                  href: "https://fabnummas.notion.site/Espace-documentaire-218653b7be07800f9981d837b2df6520",
                  title: "Espace documentaire - France VAE",
                },
                text: "Espace documentaire",
              },
              {
                buttonProps: {
                  onClick: () => logout(),
                  className: "!text-sm !px-3 !py-1 !mb-4 !mx-1",
                },
                text: (
                  <span>
                    Se déconnecter
                    <span className="ml-1.5 ri-logout-box-r-line fr-icon--sm" />
                  </span>
                ),
              },
            ] as QuickAccessItem[])
          : []
      }
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
    />
  );
};
