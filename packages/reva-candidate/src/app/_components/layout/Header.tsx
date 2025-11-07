"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useParams, usePathname } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

const getNavigation = ({
  currentPathname,
  candidateHelpIsActive,
  candidateId,
  candidacyId,
  isMultiCandidacyFeatureActive,
}: {
  currentPathname: string;
  candidateHelpIsActive: boolean;
  candidateId: string;
  candidacyId: string;
  isMultiCandidacyFeatureActive: boolean;
}) => {
  return [
    {
      text: isMultiCandidacyFeatureActive
        ? "Mes candidatures"
        : "Ma candidature",
      linkProps: {
        href: isMultiCandidacyFeatureActive
          ? `/candidates/${candidateId}/candidacies/`
          : `/candidates/${candidateId}/`,
        target: "_self",
      },
      isActive:
        currentPathname ===
        (isMultiCandidacyFeatureActive
          ? `/candidates/${candidateId}/candidacies/`
          : `/candidates/${candidateId}/candidacies/${candidacyId}/`),
    },
    {
      text: "Mon profil",
      linkProps: {
        href: `/candidates/${candidateId}/profile`,
        target: "_self",
      },
      isActive: currentPathname.startsWith(
        `/candidates/${candidateId}/profile`,
      ),
    },
    ...(candidateHelpIsActive
      ? [
          {
            text: "Aide",
            linkProps: {
              href: `/candidates/${candidateId}/help`,
              target: "_self",
            },
            isActive: currentPathname.startsWith(
              `/candidates/${candidateId}/help`,
            ),
          },
        ]
      : []),
  ];
};
export const Header = () => {
  const { authenticated, logout } = useKeycloakContext();

  const currentPathname = usePathname();

  const { candidateId, candidacyId } = useParams<{
    candidateId: string;
    candidacyId: string;
  }>();

  const isCandidacyDeletedPath = currentPathname.startsWith(
    `/candidates/${candidateId}/candidacies/${candidacyId}/candidacy-deleted`,
  );

  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const candidateHelpIsActive = isFeatureActive("candidate-help");
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  const navigation =
    !authenticated || isCandidacyDeletedPath
      ? []
      : getNavigation({
          currentPathname,
          candidateHelpIsActive,
          candidateId,
          candidacyId,
          isMultiCandidacyFeatureActive,
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
