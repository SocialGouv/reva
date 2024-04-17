"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import SideMenu, { SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
const agenciesInfoForConnectedUserQuery = graphql(`
  query getAgenciesInfoForConnectedUser {
    account_getAccountForConnectedUser {
      organism {
        id
      }
    }
  }
`);

const AgenciesSettingsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { isOrganism, isGestionnaireMaisonMereAAP } = useAuth();

  const { graphqlClient } = useGraphQlClient();

  const { data: agenciesInfoForConnectedUserResponse } = useQuery({
    queryKey: ["agencies"],
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
  const getNavItems = () => {
    let items: SideMenuProps.Item[] = [];
    if (isGestionnaireMaisonMereAAP) {
      items = [];
    } else if (isOrganism) {
      const organismId =
        agenciesInfoForConnectedUserResponse?.account_getAccountForConnectedUser
          ?.organism?.id;
      items = [
        getNavItem({
          text: "Informations commerciales",
          href: `/agencies-settings/${organismId}/commercial-information`,
        }),
        getNavItem({
          text: "Absences et fermetures",
          href: `/agencies-settings/${organismId}/absence`,
        }),
        getNavItem({
          text: "Responsable d'agence",
          href: `/agencies-settings/${organismId}/manager`,
        }),
      ];
    }
    return items;
  };

  return (
    <div className="flex">
      <SideMenu
        className="flex-shrink-0 md:w-[330px]"
        align="left"
        classes={{ inner: "h-full" }}
        burgerMenuButtonText="Agences"
        title="Paramètres des agences"
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
