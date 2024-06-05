"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

const getFeasibilityCountByCategoryQuery = graphql(`
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

const getDossierDeValidationCountByCategoryQuery = graphql(`
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

const getJuryCountByCategoryQuery = graphql(`
  query getJuryCountByCategory($searchFilter: String) {
    jury_juryCountByCategory(searchFilter: $searchFilter) {
      SCHEDULED
      PASSED
    }
  }
`);

const CandidaciesLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  const searchFilter = searchParams.get("search") || "";

  const { graphqlClient } = useGraphQlClient();

  const { data: getFeasibilityCountByCategoryResponse } = useQuery({
    queryKey: ["getFeasibilityCountByCategory", searchFilter],
    queryFn: () =>
      graphqlClient.request(getFeasibilityCountByCategoryQuery, {
        searchFilter,
      }),
  });

  const { data: getDossierDeValidationCountByCategoryResponse } = useQuery({
    queryKey: ["getDossierDeValidationCountByCategory", searchFilter],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationCountByCategoryQuery, {
        searchFilter,
      }),
  });

  const { data: getJuryCountByCategoryResponse } = useQuery({
    queryKey: ["getJuryCountByCategory", searchFilter],
    queryFn: () =>
      graphqlClient.request(getJuryCountByCategoryQuery, {
        searchFilter,
      }),
  });

  const hrefSideMenu = (path: string, category: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("CATEGORY", category);

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `${path}/?${params.toString()}`;
  };

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
      href: hrefSideMenu(path, category),
      target: "_self",
    },
    text,
  });

  //Only apply layout if children are direct descendants (ie: /candidacies/feasibilities but not /candidacies/feasibilities/feasibilityId)
  const isPagePathAfterFirstlevel = !!currentPathname.match(
    /\/candidacies(\/.+){2,}/,
  );
  if (isPagePathAfterFirstlevel) {
    return <>{children}</>;
  }

  const feasibilityCountByCategory =
    getFeasibilityCountByCategoryResponse?.feasibilityCountByCategory;

  const dossierDeValidationCountByCategory =
    getDossierDeValidationCountByCategoryResponse?.dossierDeValidation_dossierDeValidationCountByCategory;

  const juryCountByCategory =
    getJuryCountByCategoryResponse?.jury_juryCountByCategory;

  const feasibilityItems = [
    menuItem({
      text: `Tous les dossiers actifs (${feasibilityCountByCategory?.ALL || 0})`,
      path: "/candidacies/feasibilities",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.PENDING || 0})`,
      path: "/candidacies/feasibilities",
      category: "PENDING",
    }),
    menuItem({
      text: `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE || 0})`,
      path: "/candidacies/feasibilities",
      category: "ADMISSIBLE",
    }),
    menuItem({
      text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED || 0})`,
      path: "/candidacies/feasibilities",
      category: "REJECTED",
    }),
    menuItem({
      text: `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE || 0})`,
      path: "/candidacies/feasibilities",
      category: "INCOMPLETE",
    }),
    menuItem({
      text: `Dossiers supprimés (${feasibilityCountByCategory?.ARCHIVED || 0})`,
      path: "/candidacies/feasibilities",
      category: "ARCHIVED",
    }),
    menuItem({
      text: `Dossiers abandonnés (${feasibilityCountByCategory?.DROPPED_OUT || 0})`,
      path: "/candidacies/feasibilities",
      category: "DROPPED_OUT",
    }),
  ];

  const dossierDeValidationItems = [
    menuItem({
      text: `Tous les dossiers actifs (${dossierDeValidationCountByCategory?.ALL || 0})`,
      path: "/candidacies/dossiers-de-validation",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Dossiers reçus / jurys à programmer (${dossierDeValidationCountByCategory?.PENDING || 0})`,
      path: "/candidacies/dossiers-de-validation",
      category: "PENDING",
    }),
    menuItem({
      text: `Dossiers signalés (${dossierDeValidationCountByCategory?.INCOMPLETE || 0})`,
      path: "/candidacies/dossiers-de-validation",
      category: "INCOMPLETE",
    }),
  ];

  const juryItems = [
    menuItem({
      text: `Tous`,
      path: "/candidacies/juries",
      category: "ALL",
    }),
    menuItem({
      text: `Programmés (${juryCountByCategory?.SCHEDULED || 0})`,
      path: "/candidacies/juries",
      category: "SCHEDULED",
    }),
    menuItem({
      text: `Passés (${juryCountByCategory?.PASSED || 0})`,
      path: "/candidacies/juries",
      category: "PASSED",
    }),
  ];

  const menuItems = [
    {
      items: feasibilityItems,
      text: "Dossiers de faisabilité",
      expandedByDefault: currentPathname.startsWith(
        "/candidacies/feasibilities",
      ),
    },
    {
      items: dossierDeValidationItems,
      text: "Dossiers de validation",
      expandedByDefault: currentPathname.startsWith(
        "/candidacies/dossiers-de-validation",
      ),
    },
    {
      items: juryItems,
      text: "Jury",
      expandedByDefault: currentPathname.startsWith("/candidacies/juries"),
    },
  ];

  return (
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
  );
};

export default CandidaciesLayout;
