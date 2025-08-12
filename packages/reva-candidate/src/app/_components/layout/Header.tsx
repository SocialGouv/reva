"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

import { useLayout } from "@/app/_components/layout/layout.hook";
import { useKeycloakContext } from "@/components/auth/keycloak.context";

const getNavigation = ({
  authenticated,
  currentPathname,
  isInactifEnAttente,
}: {
  authenticated: boolean;
  currentPathname: string;
  isInactifEnAttente: boolean;
}) => {
  if (!authenticated || isInactifEnAttente) return [];

  return [
    {
      text: "Ma candidature",
      linkProps: {
        href: "/",
        target: "_self",
      },
      isActive: currentPathname === "/",
    },
    {
      text: "Mon profil",
      linkProps: {
        href: "/profile",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/profile"),
    },
  ];
};
export const Header = () => {
  const { authenticated, logout } = useKeycloakContext();
  const currentPathname = usePathname();
  const { candidate } = useLayout();
  const isInactifEnAttente =
    candidate?.candidacy.activite === "INACTIF_EN_ATTENTE";

  const navigation = getNavigation({
    authenticated,
    currentPathname,
    isInactifEnAttente,
  });

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
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/candidat/fvae_logo.svg",
        orientation: "horizontal",
      }}
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
      quickAccessItems={
        authenticated
          ? [
              {
                buttonProps: {
                  onClick: logout,
                  className: "!text-sm !px-3 !py-1 !mb-4 !mx-1",
                },
                iconId: "ri-logout-box-r-line",
                text: "Se déconnecter",
              },
            ]
          : undefined
      }
      navigation={navigation}
    />
  );
};
