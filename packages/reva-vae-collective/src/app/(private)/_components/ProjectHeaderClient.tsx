"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useParams, usePathname } from "next/navigation";
import { ComponentProps } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

const PATHS = {
  COHORTES: "/cohortes",
  DASHBOARD: "/dashboard",
} as const;

const LABELS = {
  COHORTES: "Cohortes",
  DASHBOARD: "Pilotage",
} as const;

const createTab = ({
  text,
  href,
  isActive,
  additionalProps = {},
}: {
  text: string;
  href: string;
  isActive: boolean;
  additionalProps?: Record<string, unknown>;
}) => ({
  text,
  linkProps: { href, target: "_self", ...additionalProps },
  isActive,
});

export const ProjectHeaderClient = ({
  isMetabaseDashboardActive,
}: {
  isMetabaseDashboardActive: boolean;
}) => {
  const { logout, authenticated } = useKeycloakContext();

  const currentPathname = usePathname();
  const { commanditaireId } = useParams();
  const isCommanditairePath = currentPathname.startsWith(
    `/commanditaires/${commanditaireId}`,
  );

  const navigation =
    authenticated && isMetabaseDashboardActive && isCommanditairePath
      ? [
          createTab({
            text: LABELS.COHORTES,
            href: `/commanditaires/${commanditaireId}${PATHS.COHORTES}`,
            isActive: currentPathname.includes(PATHS.COHORTES),
          }),
          createTab({
            text: LABELS.DASHBOARD,
            href: `/commanditaires/${commanditaireId}${PATHS.DASHBOARD}`,
            isActive: currentPathname.includes(PATHS.DASHBOARD),
          }),
        ]
      : [];

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
        href: "/../",
        title: "Accueil - France VAE",
      }}
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/vae-collective/images/fvae_logo.svg",
        orientation: "horizontal",
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
      navigation={navigation}
    />
  );
};
