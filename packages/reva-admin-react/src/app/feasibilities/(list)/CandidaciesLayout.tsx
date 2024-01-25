"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { useSearchFilterFeasibilitiesStore } from "./useSearchFilterFeasibilitiesStore";
export const getFeasibilityCountByCategoryQuery = graphql(`
  query getFeasibilityCountByCategory($searchFilter: String) {
    feasibilityCountByCategory(searchFilter: $searchFilter) {
      ALL
      PENDING
      REJECTED
      ADMISSIBLE
      INCOMPLETE
      ARCHIVED
      DROPPED_OUT
    }
  }
`);

export const getDossierDeValidationCountByCategoryQuery = graphql(`
  query getDossierDeValidationCountByCategory {
    dossierDeValidation_dossierDeValidationCountByCategory {
      ALL
      PENDING
      INCOMPLETE
    }
  }
`);

const CandidaciesLayout = ({ children }: { children: ReactNode }) => {
  const { searchFilter } = useSearchFilterFeasibilitiesStore();
  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureflipping();

  const {
    data: getFeasibilityCountByCategoryResponse,
    status: getFeasibilityCountByCategoryStatus,
  } = useQuery({
    queryKey: ["getFeasibilityCountByCategory", searchFilter],
    queryFn: () =>
      graphqlClient.request(getFeasibilityCountByCategoryQuery, {
        searchFilter,
      }),
  });

  const {
    data: getDossierDeValidationCountByCategoryResponse,
    status: getDossierDeValidationCountByCategoryStatus,
  } = useQuery({
    queryKey: ["getDossierDeValidationCountByCategory"],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationCountByCategoryQuery),
  });

  const menuItem = ({
    text,
    path,
    category,
    defaultMenuItem,
  }: {
    text: string;
    path: string;
    category: string;
    defaultMenuItem?: boolean;
  }) => ({
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

  const dossierDeValidationCountByCategory =
    getDossierDeValidationCountByCategoryResponse?.dossierDeValidation_dossierDeValidationCountByCategory;

  const menuItems = isFeatureActive("DOSSIER_DE_VALIDATION")
    ? [
        {
          items: [
            menuItem({
              text: `Tous les dossiers actifs (${feasibilityCountByCategory?.ALL})`,
              path: "/feasibilities",
              category: "ALL",
              defaultMenuItem: true,
            }),
            menuItem({
              text: `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.PENDING})`,
              path: "/feasibilities",
              category: "PENDING",
            }),
            menuItem({
              text: `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE})`,
              path: "/feasibilities",
              category: "ADMISSIBLE",
            }),
            menuItem({
              text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED})`,
              path: "/feasibilities",
              category: "REJECTED",
            }),
            menuItem({
              text: `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE})`,
              path: "/feasibilities",
              category: "INCOMPLETE",
            }),
            menuItem({
              text: `Dossiers archivés (${feasibilityCountByCategory?.ARCHIVED})`,
              path: "/feasibilities",
              category: "ARCHIVED",
            }),
            menuItem({
              text: `Dossiers abandonnés (${feasibilityCountByCategory?.DROPPED_OUT})`,
              path: "/feasibilities",
              category: "DROPPED_OUT",
            }),
          ],
          text: "Dossiers de faisabilité",
          expandedByDefault: !!currentPathname.match(/feasibilities$/),
        },
        {
          items: [
            menuItem({
              text: `Tous les dossiers actifs (${dossierDeValidationCountByCategory?.ALL})`,
              path: "/feasibilities/dossier-de-validation",
              category: "ALL",
              defaultMenuItem: true,
            }),
            menuItem({
              text: `Dossiers en attente de validation (${dossierDeValidationCountByCategory?.PENDING})`,
              path: "/feasibilities/dossier-de-validation",
              category: "PENDING",
            }),
            menuItem({
              text: `Dossiers incomplets (${dossierDeValidationCountByCategory?.INCOMPLETE})`,
              path: "/feasibilities/dossier-de-validation",
              category: "INCOMPLETE",
            }),
          ],
          text: "Dossiers de validation",
          expandedByDefault: currentPathname.startsWith(
            "/feasibilities/dossier-de-validation",
          ),
        },
      ]
    : [
        menuItem({
          text: `Tous les dossiers actifs (${feasibilityCountByCategory?.ALL})`,
          path: "/feasibilities",
          category: "ALL",
          defaultMenuItem: true,
        }),
        menuItem({
          text: `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.PENDING})`,
          path: "/feasibilities",
          category: "PENDING",
        }),
        menuItem({
          text: `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE})`,
          path: "/feasibilities",
          category: "ADMISSIBLE",
        }),
        menuItem({
          text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED})`,
          path: "/feasibilities",
          category: "REJECTED",
        }),
        menuItem({
          text: `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE})`,
          path: "/feasibilities",
          category: "INCOMPLETE",
        }),
        menuItem({
          text: `Dossiers archivés (${feasibilityCountByCategory?.ARCHIVED})`,
          path: "/feasibilities",
          category: "ARCHIVED",
        }),
        menuItem({
          text: `Dossiers abandonnés (${feasibilityCountByCategory?.DROPPED_OUT})`,
          path: "/feasibilities",
          category: "DROPPED_OUT",
        }),
      ];

  return (
    getFeasibilityCountByCategoryStatus === "success" && (
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
          align="left"
          burgerMenuButtonText="Inscriptions"
          sticky
          fullHeight
          items={menuItems}
        />
        <div className="mt-3 flex-1">{children}</div>
      </div>
    )
  );
};

export default CandidaciesLayout;
