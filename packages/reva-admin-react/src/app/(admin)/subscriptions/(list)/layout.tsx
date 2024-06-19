"use client";
import { ReactNode, useCallback, useMemo } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname, useSearchParams } from "next/navigation";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

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
      UP_TO_DATE
    }
  }
`);

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
  const { graphqlClient } = useGraphQlClient();
  const currentPathname = usePathname();

  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

  const {
    data: getSubscriptionCountByStatusResponse,
    status: getSubscriptionCountByStatusStatus,
  } = useQuery({
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

  const featureFlipping = useFeatureflipping();
  const showLegalMenuItems = featureFlipping.isFeatureActive(
    "LEGAL_INFORMATION_VALIDATION",
  );

  const items = useMemo(() => {
    if (showLegalMenuItems) {
      return [
        menuItem(
          "En attente (sous l'ancienne méthode)",
          hrefSideMenu("pending"),
          currentPathname,
        ),
        menuItem(
          "Refusées (sous l'ancienne méthode)",
          hrefSideMenu("rejected"),
          currentPathname,
        ),
        menuItem(
          "Validées (sous l'ancienne méthode)",
          hrefSideMenu("validated"),
          currentPathname,
        ),
        menuItem(
          "En attente",
          hrefSideMenu("pending-v2"),
          currentPathname,
          subscriptionCountByStatus?.PENDING_SUBSCRIPTION,
        ),
        menuItem(
          "Refusées",
          hrefSideMenu("rejected-v2"),
          currentPathname,
          subscriptionCountByStatus?.REJECTED_SUBSCRIPTION,
        ),
        menuItem(
          "Pièces jointes à vérifier",
          hrefSideMenu("check-legal-information"),
          currentPathname,
          subscriptionCountByStatus?.PENDING_LEGAL_VERIFICATION,
        ),
        menuItem(
          "Validées et mises à jour",
          hrefSideMenu("up-to-date"),
          currentPathname,
          subscriptionCountByStatus?.UP_TO_DATE,
        ),
      ];
    }
    return [
      menuItem("En attente", hrefSideMenu("pending"), currentPathname),
      menuItem("Validées", hrefSideMenu("validated"), currentPathname),
      menuItem("Refusées", hrefSideMenu("rejected"), currentPathname),
    ];
  }, [
    showLegalMenuItems,
    subscriptionCountByStatus,
    currentPathname,
    hrefSideMenu,
  ]);

  return (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Inscriptions"
        sticky
        fullHeight
        title="Inscriptions"
        items={items}
      />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default SubscriptionsLayout;
