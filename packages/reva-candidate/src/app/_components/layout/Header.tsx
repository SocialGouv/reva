"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

import { useLayout } from "@/app/_components/layout/layout.hook";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

const getNavigation = ({
  authenticated,
  currentPathname,
  isInactifEnAttente,
  isCandidacyDeletedPath,
  candidateHelpIsActive,
  isEndAccompagnementPending,
}: {
  authenticated: boolean;
  currentPathname: string;
  isInactifEnAttente: boolean;
  isCandidacyDeletedPath: boolean;
  candidateHelpIsActive: boolean;
  isEndAccompagnementPending: boolean;
}) => {
  if (
    !authenticated ||
    isInactifEnAttente ||
    isCandidacyDeletedPath ||
    isEndAccompagnementPending
  )
    return [];

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
    ...(candidateHelpIsActive
      ? [
          {
            text: "Aide",
            linkProps: {
              href: "/help",
              target: "_self",
            },
            isActive: currentPathname.startsWith("/help"),
          },
        ]
      : []),
  ];
};
export const Header = () => {
  const { authenticated, logout } = useKeycloakContext();
  const currentPathname = usePathname();
  const { candidate, isEndAccompagnementPending } = useLayout();
  const isInactifEnAttente =
    candidate?.candidacy.activite === "INACTIF_EN_ATTENTE";
  const isCandidacyDeletedPath =
    currentPathname.startsWith("/candidacy-deleted");
  const { isFeatureActive } = useFeatureFlipping();
  const candidateHelpIsActive = isFeatureActive("candidate-help");

  const navigation = getNavigation({
    authenticated,
    currentPathname,
    isInactifEnAttente,
    isCandidacyDeletedPath,
    candidateHelpIsActive,
    isEndAccompagnementPending,
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
