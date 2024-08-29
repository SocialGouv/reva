"use client";
import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { SideMenu, SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
const agenciesInfoForConnectedUserQuery = graphql(`
  query getAgenciesInfoForConnectedUserV2 {
    account_getAccountForConnectedUser {
      organism {
        id
        isHeadAgency
      }
      maisonMereAAP {
        organisms {
          id
          isHeadAgency
          label
          informationsCommerciales {
            nom
          }
          accounts {
            id
            email
            firstname
            lastname
          }
        }
      }
    }
  }
`);

const AgenciesSettingsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { isOrganism, isGestionnaireMaisonMereAAP } = useAuth();

  const { graphqlClient } = useGraphQlClient();

  const {
    data: agenciesInfoForConnectedUserResponse,
    status: agenciesInfoForConnectedUserStatus,
  } = useQuery({
    queryKey: ["organisms", "agencies-settings-layout-page-v2"],
    queryFn: () => graphqlClient.request(agenciesInfoForConnectedUserQuery),
  });

  const { isFeatureActive } = useFeatureflipping();
  const isSettingsEnabled = isFeatureActive("AAP_SETTINGS_V3");
  if (isSettingsEnabled) {
    return children;
  }

  const getNavItem = ({
    text,
    href,
  }: {
    text: string;
    href: string;
  }): SideMenuProps.Item => ({
    text,
    linkProps: { href },
    isActive: !!currentPathname.match(new RegExp(`^${href}.*$`)),
  });

  const getOrganismNavItems = ({
    organismId,
    organismType,
  }: {
    organismId: string;
    organismType: "REMOTE" | "ONSITE";
  }) => [
    getNavItem({
      text: "Informations générales",
      href: `/agencies-settings/organisms/${organismId}/informations-generales/${organismType === "ONSITE" ? "sur-site" : "distance"}`,
    }),

    getNavItem({
      text: "Filières, branches et niveaux",
      href: `/agencies-settings/organisms/${organismId}/certifications`,
    }),
    getNavItem({
      text: "Visibilité dans les recherches",
      href: `/agencies-settings/organisms/${organismId}/absence`,
    }),
  ];

  const getNavItems = () => {
    const selectedItemStyle =
      "before:content-[''] before:absolute before:top-[0.75rem] before:bottom-[0.75rem] before:bg-dsfr-blue-france-sun-113 before:w-[2px] before:left-0 text-dsfr-blue-france-sun-113";

    const isOrgansismSelected = ({ organismId }: { organismId: string }) => {
      const href = `/agencies-settings/organisms/${organismId}`;
      return !!currentPathname.match(new RegExp(`^${href}.*$`));
    };

    const isUserAccountSelected = ({ accountId }: { accountId: string }) => {
      const href = `/agencies-settings/user-accounts/${accountId}`;
      return !!currentPathname.match(new RegExp(`^${href}.*$`));
    };

    let items: SideMenuProps.Item[] = [];
    const organismId =
      agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
        ?.organism?.id;
    const agencies =
      agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
        ?.maisonMereAAP?.organisms || [];

    const organism =
      agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
        ?.organism;

    if (isGestionnaireMaisonMereAAP) {
      const headAgency = agencies.find((a) => a.isHeadAgency);
      const remoteMenu = {
        text: "Accompagnement à distance",
        expandedByDefault: false,
        linkProps: {
          href: "#",
          className: "fr-sidemenu__btn bg-transparent font-bold",
        },
        items: getOrganismNavItems({
          organismId: headAgency?.id || "",
          organismType: "REMOTE",
        }),
      };
      const onSiteMenu = {
        text: "Accompagnement en présentiel",
        expandedByDefault: true,
        linkProps: {
          href: "#",
          className: "fr-sidemenu__btn bg-transparent font-bold",
        },
        items: [
          ...agencies
            .filter((a) => !a.isHeadAgency)
            .sort((a, b) => {
              const aName = a.informationsCommerciales?.nom || a.label;
              const bName = b.informationsCommerciales?.nom || b.label;
              return aName.localeCompare(bName);
            })
            .map((a) => {
              return {
                text: `${a.informationsCommerciales?.nom || a.label}`,
                linkProps: {
                  href: "#",
                  className: `fr-sidemenu__btn bg-transparent ${
                    isOrgansismSelected({ organismId: a.id })
                      ? selectedItemStyle
                      : ""
                  } `,
                },
                items: getOrganismNavItems({
                  organismId: a.id,
                  organismType: "ONSITE",
                }),
              };
            }),
          {
            isActive: false,
            linkProps: {
              href: "/agencies-settings/organisms/add-agency/",
              target: "_self",
            },
            text: (
              <Button size="small" priority="secondary">
                Ajouter un lieu d'accueil
              </Button>
            ),
          },
        ],
      };

      const userAccountsMenu = {
        text: "Comptes collaborateurs",
        expandedByDefault: true,
        linkProps: {
          href: "#",
          className: "fr-sidemenu__btn bg-transparent font-bold",
        },
        items: [
          ...agencies
            .flatMap((agency) => agency.accounts)
            .sort((a, b) =>
              `${a.firstname} ${a.lastname}`.localeCompare(
                `${b.firstname} ${b.lastname}`,
              ),
            )
            .map((a) => {
              return {
                text: `${a?.firstname}  ${a?.lastname}`,
                linkProps: {
                  href: `/agencies-settings/user-accounts/${a.id}/`,
                  className: `fr-sidemenu__btn bg-transparent ${
                    isUserAccountSelected({ accountId: a.id })
                      ? selectedItemStyle
                      : ""
                  } `,
                },
              };
            }),
          {
            isActive: false,
            linkProps: {
              href: "/agencies-settings/user-accounts/add-user-account/",
              target: "_self",
            },
            text: (
              <Button size="small" priority="secondary">
                Ajouter un compte
              </Button>
            ),
          },
        ],
      };

      items = [remoteMenu, onSiteMenu, userAccountsMenu];
    } else if (isOrganism) {
      items = getOrganismNavItems({
        organismId,
        organismType: organism?.isHeadAgency ? "REMOTE" : "ONSITE",
      });
    }
    return items;
  };
  return (
    agenciesInfoForConnectedUserStatus === "success" && (
      <div className="flex flex-col md:flex-row w-full">
        <SideMenu
          className="flex-shrink-0 md:w-[330px] mt-2 md:-mt-7"
          align="left"
          classes={{ inner: "h-full" }}
          burgerMenuButtonText="Paramètres"
          title=""
          fullHeight
          items={[
            getNavItem({
              text: "Informations juridiques",
              href: "/agencies-settings/legal-information",
            }),
            ...getNavItems(),
          ]}
        />
        {children}
      </div>
    )
  );
};

export default AgenciesSettingsLayout;
