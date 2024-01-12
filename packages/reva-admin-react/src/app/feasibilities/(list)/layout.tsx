"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname, useSearchParams } from "next/navigation";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const getFeasibilityCountByCategoryQuery = graphql(`
  query getFeasibilityCountByCategory {
    feasibilityCountByCategory {
      ALL
      PENDING
      REJECTED
      ADMISSIBLE
      INCOMPLETE
    }
  }
`);

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getFeasibilityCountByCategoryResponse,
    status: getFeasibilityCountByCategoryStatus,
  } = useQuery({
    queryKey: ["getFeasibilityCountByCategory"],
    queryFn: () => graphqlClient.request(getFeasibilityCountByCategoryQuery),
  });

  const menuItem = (
    text: string,
    path: string,
    category: string,
    defaultMenuItem?: boolean,
  ) => ({
    isActive:
      (currentPathname.startsWith(path) &&
        searchParams.get("CATEGORY") === category) ||
      (!searchParams.get("CATEGORY") && defaultMenuItem),
    linkProps: {
      href: `${path}?CATEGORY=${category}`,
      target: "_self",
    },
    text,
  });

  const feasibilityCountByCategory =
    getFeasibilityCountByCategoryResponse?.feasibilityCountByCategory;

  return (
    getFeasibilityCountByCategoryStatus === "success" && (
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
          align="left"
          burgerMenuButtonText="Inscriptions"
          sticky
          fullHeight
          items={[
            menuItem(
              `Tous les dossiers de faisabilité (${feasibilityCountByCategory?.ALL})`,
              "/feasibilities",
              "ALL",
              true,
            ),
            menuItem(
              `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.PENDING})`,
              "/feasibilities",
              "PENDING",
            ),
            menuItem(
              `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE})`,
              "/feasibilities",
              "ADMISSIBLE",
            ),
            menuItem(
              `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED})`,
              "/feasibilities",
              "REJECTED",
            ),
            menuItem(
              `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE})`,
              "/feasibilities",
              "INCOMPLETE",
            ),
          ]}
        />
        <div className="mt-3 flex-1">{children}</div>
      </div>
    )
  );
};

export default SubscriptionsLayout;
