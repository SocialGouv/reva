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
  query getAgenciesInfoForConnectedUser {
    account_getAccountForConnectedUser {
      organism {
        id
      }
      maisonMereAAP {
        organisms {
          id
          isHeadAgency
          label
          informationsCommerciales {
            nom
          }
        }
      }
    }
  }
`);

const AgenciesSettingsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { isOrganism, isGestionnaireMaisonMereAAP } = useAuth();
  const { isFeatureActive } = useFeatureflipping();

  const { graphqlClient } = useGraphQlClient();

  const { data: agenciesInfoForConnectedUserResponse } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(agenciesInfoForConnectedUserQuery),
  });

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

  const getOrganismNavItems = ({ organismId }: { organismId: string }) => [
    ...(isFeatureActive("AAP_INTERVENTION_ZONE_UPDATE")
      ? [
          getNavItem({
            text: "Modalités d'accompagnement",
            href: `/agencies-settings/${organismId}/modalites-accompagnement`,
          }),
        ]
      : [
          getNavItem({
            text: "Informations commerciales",
            href: `/agencies-settings/${organismId}/commercial-information`,
          }),
          getNavItem({
            text: "Zone d'intervention",
            href: `/agencies-settings/${organismId}/intervention-zone`,
          }),
        ]),
    getNavItem({
      text: "Certifications",
      href: `/agencies-settings/${organismId}/certifications`,
    }),
    getNavItem({
      text: "Absences et fermetures",
      href: `/agencies-settings/${organismId}/absence`,
    }),
    getNavItem({
      text: "Administrateur du compte",
      href: `/agencies-settings/${organismId}/manager`,
    }),
  ];

  const getNavItems = () => {
    const selectedItemStyle =
      "before:content-[''] before:absolute before:top-[0.75rem] before:bottom-[0.75rem] before:bg-dsfr-blue-france-sun-113 before:w-[2px] before:left-0 text-dsfr-blue-france-sun-113";

    const isOrgansismSelected = ({ organismId }: { organismId: string }) => {
      const href = `/agencies-settings/${organismId}`;
      return !!currentPathname.match(new RegExp(`^${href}.*$`));
    };

    let items: SideMenuProps.Item[] = [];
    const organismId =
      agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
        ?.organism?.id;
    const agencies =
      agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
        ?.maisonMereAAP?.organisms || [];

    if (isGestionnaireMaisonMereAAP) {
      items = [
        {
          text: "Agences",
          expandedByDefault: true,
          linkProps: {
            href: "#",
            className: "fr-sidemenu__btn bg-transparent text-xl font-bold",
          },
          items: [
            ...agencies
              .sort((a, b) => {
                if (a.isHeadAgency) return -1;
                if (b.isHeadAgency) return 1;
                const aName = a.informationsCommerciales?.nom || a.label;
                const bName = b.informationsCommerciales?.nom || b.label;
                return aName.localeCompare(bName);
              })
              .map((a) => {
                return {
                  text: `${a.informationsCommerciales?.nom || a.label} ${
                    a.isHeadAgency ? "(Agence administratrice)" : ""
                  }`,
                  expandedByDefault: a.isHeadAgency,
                  linkProps: {
                    href: "#",
                    className: `fr-sidemenu__btn bg-transparent font-bold ${
                      isOrgansismSelected({ organismId: a.id })
                        ? selectedItemStyle
                        : ""
                    } `,
                  },
                  items: getOrganismNavItems({
                    organismId: a.id,
                  }),
                };
              }),
            {
              isActive: false,
              linkProps: {
                href: isFeatureActive("AAP_INTERVENTION_ZONE_UPDATE")
                  ? "/agencies-settings/add-agency/"
                  : "/agencies-settings/add-agence/",
                target: "_self",
              },
              text: (
                <Button size="small" priority="secondary">
                  Ajouter une agence
                </Button>
              ),
            },
          ],
        },
      ];
    } else if (isOrganism) {
      items = getOrganismNavItems({
        organismId,
      });
    }
    return items;
  };
  return (
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
  );
};

export default AgenciesSettingsLayout;
