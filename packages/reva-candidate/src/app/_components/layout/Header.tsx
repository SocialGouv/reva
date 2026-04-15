"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";

import { UserDropdown } from "./UserDropdown";

const NAVIGATION_FORBIDDEN_PATHS = [
  "/end-accompagnement",
  "/candidacy-inactif",
  "/candidacy-deleted",
  "/candidacy-dropout-decision",
  "/dropout-confirmation",
  "/first-connexion",
];

const getNavigation = ({
  currentPathname,
  candidateId,
  candidacyId,
}: {
  currentPathname: string;
  candidateId: string;
  candidacyId: string;
}) => {
  return [
    {
      text: "Mes candidatures",
      linkProps: {
        href: `/candidates/${candidateId}/candidacies/`,
        target: "_self",
      },
      isActive:
        currentPathname ===
        `/candidates/${candidateId}/candidacies/${candidacyId}/`,
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
    {
      text: "Aide",
      linkProps: {
        href: `/candidates/${candidateId}/help`,
        target: "_self",
      },
      isActive: currentPathname.startsWith(`/candidates/${candidateId}/help`),
    },
  ];
};

export const Header = () => {
  const { authenticated } = useKeycloakContext();

  const currentPathname = usePathname();

  const queryParams = useSearchParams();

  const navigationDisabledByQueryParam =
    queryParams.get("navigationDisabled") === "true";

  const { candidateId, candidacyId } = useParams<{
    candidateId: string;
    candidacyId: string;
  }>();

  const isForbiddenPath = NAVIGATION_FORBIDDEN_PATHS.some((path) =>
    currentPathname.includes(path),
  );

  const navigation =
    !authenticated || isForbiddenPath || navigationDisabledByQueryParam
      ? []
      : getNavigation({
          currentPathname,
          candidateId,
          candidacyId,
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
        authenticated ? [<UserDropdown key="user-dropdown" />] : undefined
      }
      navigation={navigation}
    />
  );
};
