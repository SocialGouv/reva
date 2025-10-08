"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

import { useHeader } from "@/app/_components/layout/Header.hook";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

const getNavigation = ({
  candidacyId,
  currentPathname,
  candidateHelpIsActive,
}: {
  candidacyId: string;
  currentPathname: string;
  candidateHelpIsActive: boolean;
}) => {
  return [
    {
      text: "Ma candidature",
      linkProps: {
        href: `/${candidacyId}`,
        target: "_self",
      },
      isActive: currentPathname === `/${candidacyId}/`,
    },
    {
      text: "Mon profil",
      linkProps: {
        href: `/${candidacyId}/profile`,
        target: "_self",
      },
      isActive: currentPathname.startsWith(`/${candidacyId}/profile`),
    },
    ...(candidateHelpIsActive
      ? [
          {
            text: "Aide",
            linkProps: {
              href: `/${candidacyId}/help`,
              target: "_self",
            },
            isActive: currentPathname.startsWith(`/${candidacyId}/help`),
          },
        ]
      : []),
  ];
};
export const Header = () => {
  const { authenticated, logout } = useKeycloakContext();

  const currentPathname = usePathname();

  const { candidacyId, candidacy } = useHeader();

  const isInactifEnAttente = candidacy?.activite === "INACTIF_EN_ATTENTE";
  const isEndAccompagnementPending =
    candidacy?.endAccompagnementStatus === "PENDING";

  const isCandidacyDeletedPath =
    currentPathname.startsWith("/candidacy-deleted");

  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const candidateHelpIsActive = isFeatureActive("candidate-help");

  const navigation =
    !candidacyId ||
    !authenticated ||
    isInactifEnAttente ||
    isCandidacyDeletedPath ||
    isEndAccompagnementPending
      ? []
      : getNavigation({
          candidacyId,
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
