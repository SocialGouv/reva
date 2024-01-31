"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { useSearchFilterFeasibilitiesStore } from "./(components)/useSearchFilterFeasibilitiesStore";
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
  query getDossierDeValidationCountByCategory($searchFilter: String) {
    dossierDeValidation_dossierDeValidationCountByCategory(
      searchFilter: $searchFilter
    ) {
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
    queryKey: ["getDossierDeValidationCountByCategory", searchFilter],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationCountByCategoryQuery, {
        searchFilter,
      }),
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

  const isChildComponent = !!currentPathname.match(
    /\/(feasibilities|dossiers-de-validation|juries)\/[A-Za-z0-9_-]+$/,
  );

  if (isChildComponent) {
    return <>{children}</>;
  }

  const feasibilityCountByCategory =
    getFeasibilityCountByCategoryResponse?.feasibilityCountByCategory;

  const dossierDeValidationCountByCategory =
    getDossierDeValidationCountByCategoryResponse?.dossierDeValidation_dossierDeValidationCountByCategory;

  const feasibilityItems = [
    menuItem({
      text: `Tous les dossiers actifs (${feasibilityCountByCategory?.ALL})`,
      path: "/candidacies/feasibilities",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.PENDING})`,
      path: "/candidacies/feasibilities",
      category: "PENDING",
    }),
    menuItem({
      text: `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE})`,
      path: "/candidacies/feasibilities",
      category: "ADMISSIBLE",
    }),
    menuItem({
      text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED})`,
      path: "/candidacies/feasibilities",
      category: "REJECTED",
    }),
    menuItem({
      text: `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE})`,
      path: "/candidacies/feasibilities",
      category: "INCOMPLETE",
    }),
    menuItem({
      text: `Dossiers archivés (${feasibilityCountByCategory?.ARCHIVED})`,
      path: "/candidacies/feasibilities",
      category: "ARCHIVED",
    }),
    menuItem({
      text: `Dossiers abandonnés (${feasibilityCountByCategory?.DROPPED_OUT})`,
      path: "/candidacies/feasibilities",
      category: "DROPPED_OUT",
    }),
  ];

  const dossierDeValidationItems = [
    menuItem({
      text: `Tous les dossiers actifs (${dossierDeValidationCountByCategory?.ALL})`,
      path: "/candidacies/dossiers-de-validation",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Dossiers de validation en attente (${dossierDeValidationCountByCategory?.PENDING})`,
      path: "/candidacies/dossiers-de-validation",
      category: "PENDING",
    }),
    menuItem({
      text: `Dossiers incomplets (${dossierDeValidationCountByCategory?.INCOMPLETE})`,
      path: "/candidacies/dossiers-de-validation",
      category: "INCOMPLETE",
    }),
  ];

  const juryItems = [
    menuItem({
      text: "Jury",
      path: "/candidacies/juries",
      category: "ALL",
    }),
  ];

  const menuItems = isFeatureActive("DOSSIER_DE_VALIDATION")
    ? [
        {
          items: feasibilityItems,
          text: "Dossiers de faisabilité",
          expandedByDefault: !!currentPathname.match(/feasibilities$/),
        },
        {
          items: dossierDeValidationItems,
          text: "Dossiers de validation",
          expandedByDefault: currentPathname.startsWith(
            "/candidacies/dossiers-de-validation",
          ),
        },
        ...(isFeatureActive("JURY") ? juryItems : []),
      ]
    : feasibilityItems;

  const canDisplaySideMenu =
    getFeasibilityCountByCategoryStatus === "success" &&
    (!isFeatureActive("DOSSIER_DE_VALIDATION") ||
      getDossierDeValidationCountByCategoryStatus === "success");

  return (
    canDisplaySideMenu && (
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
          align="left"
          burgerMenuButtonText="Candidatures"
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
