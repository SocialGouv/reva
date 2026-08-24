"use client";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useCallback, useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";

import { graphql } from "@/graphql/generated";

const menuItem = (
  text: string,
  path: string,
  currentPathname: string,
  count?: number,
) => {
  const fullText = count !== undefined ? `${text} (${count})` : text;

  return {
    isActive: path.startsWith(currentPathname),
    linkProps: {
      href: path,
      target: "_self",
    },
    text: fullText,
  };
};

const getSubscriptionCountByStatus = graphql(`
  query getSubscriptionCountByStatus($searchFilter: String) {
    subscription_getSubscriptionCountByStatus(searchFilter: $searchFilter) {
      PENDING_SUBSCRIPTION
      REJECTED_SUBSCRIPTION
      PENDING_LEGAL_VERIFICATION
      NEED_LEGAL_VERIFICATION
      APPROVED
    }
  }
`);

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
  const { graphqlClient } = useGraphQlClient();
  const currentPathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

  // La barre de recherche est portée par le layout: elle pilote le `?search=` de l'onglet courant
  // et les compteurs du menu latéral.
  const onSearchFilterChange = useCallback(
    (filter: string) => {
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set("page", "1");

      if (filter) {
        queryParams.set("search", filter);
      } else {
        queryParams.delete("search");
      }

      router.push(`${currentPathname}?${queryParams.toString()}`);
    },
    [currentPathname, router, searchParams],
  );

  const { data: getSubscriptionCountByStatusResponse } = useQuery({
    queryKey: ["getSubscriptionCountByStatus", searchFilter],
    queryFn: () =>
      graphqlClient.request(getSubscriptionCountByStatus, {
        searchFilter,
      }),
  });

  const subscriptionCountByStatus =
    getSubscriptionCountByStatusResponse?.subscription_getSubscriptionCountByStatus;

  const hrefSideMenu = useCallback(
    (subPath: string) => {
      const params = new URLSearchParams();
      params.set("page", "1");

      if (searchFilter) {
        params.set("search", searchFilter);
      }

      return `/subscriptions/${subPath}/?${params.toString()}`;
    },
    [searchFilter],
  );

  const items = useMemo(
    () => [
      menuItem(
        "Inscriptions à vérifier",
        hrefSideMenu("pending"),
        currentPathname,
        subscriptionCountByStatus?.PENDING_SUBSCRIPTION,
      ),
      menuItem(
        "Inscriptions refusées",
        hrefSideMenu("rejected"),
        currentPathname,
        subscriptionCountByStatus?.REJECTED_SUBSCRIPTION,
      ),

      menuItem(
        "Comptes administrateur à vérifier",
        hrefSideMenu("check-legal-information"),
        currentPathname,
        subscriptionCountByStatus?.PENDING_LEGAL_VERIFICATION,
      ),
      menuItem(
        "Comptes administrateur incomplets",
        hrefSideMenu("validated"),
        currentPathname,
        subscriptionCountByStatus?.NEED_LEGAL_VERIFICATION,
      ),
      menuItem(
        "Comptes administrateur vérifiés",
        hrefSideMenu("up-to-date"),
        currentPathname,
        subscriptionCountByStatus?.APPROVED,
      ),
    ],
    [subscriptionCountByStatus, currentPathname, hrefSideMenu],
  );

  return (
    <div className="flex flex-col flex-1">
      <h1>Vérifications</h1>
      <SearchFilterBar
        searchFilter={searchFilter}
        onSearchFilterChange={onSearchFilterChange}
      />
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[420px]"
          align="left"
          burgerMenuButtonText="Inscriptions"
          sticky
          fullHeight
          items={items}
        />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default SubscriptionsLayout;
