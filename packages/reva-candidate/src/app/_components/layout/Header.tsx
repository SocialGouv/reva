"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

const getNavigation = ({
  currentPathname,
  candidateHelpIsActive,
}: {
  currentPathname: string;
  candidateHelpIsActive: boolean;
}) => {
  return [
    {
      text: "Mes candidatures",
      linkProps: {
        href: `/`,
        target: "_self",
      },
      isActive: currentPathname === `/`,
    },
    {
      text: "Mon profil",
      linkProps: {
        href: `/profile`,
        target: "_self",
      },
      isActive: currentPathname.startsWith(`/profile`),
    },
    ...(candidateHelpIsActive
      ? [
          {
            text: "Aide",
            linkProps: {
              href: `/help`,
              target: "_self",
            },
            isActive: currentPathname.startsWith(`/help`),
          },
        ]
      : []),
  ];
};
export const Header = () => {
  const { authenticated, logout } = useKeycloakContext();

  const currentPathname = usePathname();

  const isCandidacyDeletedPath =
    currentPathname.startsWith("/candidacy-deleted");

  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const candidateHelpIsActive = isFeatureActive("candidate-help");

  const navigation =
    !authenticated || isCandidacyDeletedPath
      ? []
      : getNavigation({
          currentPathname,
          candidateHelpIsActive,
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
