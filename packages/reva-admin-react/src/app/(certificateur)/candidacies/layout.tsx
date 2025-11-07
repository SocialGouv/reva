"use client";

import { SideMenu, SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

import { CertificationAuthority } from "./(components)/CertificationAuthority";
import { CertificationAuthorityLocalAccount } from "./(components)/CertificationAuthorityLocalAccount";

const getFeasibilityCountAndCohortesVaeCollectivesByCategoryQuery = graphql(`
  query getFeasibilityCountByCategory(
    $searchFilter: String
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
  ) {
    feasibilityCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      ALL
      PENDING
      REJECTED
      ADMISSIBLE
      COMPLETE
      INCOMPLETE
      ARCHIVED
      DROPPED_OUT
      VAE_COLLECTIVE
    }
    cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount {
      id
      nom
    }
  }
`);

const getDossierDeValidationCountByCategoryQuery = graphql(`
  query getDossierDeValidationCountByCategory(
    $searchFilter: String
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
  ) {
    dossierDeValidation_dossierDeValidationCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      ALL
      PENDING
      INCOMPLETE
    }
  }
`);

const getJuryCountByCategoryQuery = graphql(`
  query getJuryCountByCategory(
    $searchFilter: String
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
  ) {
    jury_juryCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      SCHEDULED
      PASSED
    }
  }
`);

const CandidaciesLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  const searchFilter = searchParams.get("search") || "";
  const certificationAuthorityId = searchParams.get(
    "certificationAuthorityId",
  ) as string | undefined;
  const certificationAuthorityLocalAccountId = searchParams.get(
    "certificationAuthorityLocalAccountId",
  ) as string | undefined;

  const { isAdmin, isAdminCertificationAuthority } = useAuth();

  const { graphqlClient } = useGraphQlClient();

  const {
    data: getFeasibilityCountAndCohortesVaeCollectivesByCategoryResponse,
  } = useQuery({
    queryKey: [
      "feasibilities",
      "getFeasibilityCountByCategory",
      searchFilter,
      certificationAuthorityId,
      certificationAuthorityLocalAccountId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getFeasibilityCountAndCohortesVaeCollectivesByCategoryQuery,
        {
          searchFilter,
          certificationAuthorityId,
          certificationAuthorityLocalAccountId,
        },
      ),
  });

  const { data: getDossierDeValidationCountByCategoryResponse } = useQuery({
    queryKey: [
      "getDossierDeValidationCountByCategory",
      searchFilter,
      certificationAuthorityId,
      certificationAuthorityLocalAccountId,
    ],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
      }),
  });

  const { data: getJuryCountByCategoryResponse } = useQuery({
    queryKey: [
      "getJuryCountByCategory",
      searchFilter,
      certificationAuthorityId,
      certificationAuthorityLocalAccountId,
    ],
    queryFn: () =>
      graphqlClient.request(getJuryCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
      }),
  });

  const hrefSideMenu = (
    path: string,
    category: string,
    additionalParams?: Record<string, string>,
  ) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("CATEGORY", category);

    if (searchFilter) {
      params.set("search", searchFilter);
    }
    if (certificationAuthorityId) {
      params.set("certificationAuthorityId", certificationAuthorityId);
    }
    if (certificationAuthorityLocalAccountId) {
      params.set(
        "certificationAuthorityLocalAccountId",
        certificationAuthorityLocalAccountId,
      );
    }

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.set(key, value);
      });
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
    extraParams?: Record<string, string>;
    defaultMenuItem?: boolean;
    subMenuItems?: SideMenuProps["items"];
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
  // Also exclude annuaire page
  const isPagePathAfterFirstlevel = !!currentPathname.match(
    /\/candidacies(\/.+){2,}/,
  );
  const isAnnuairePage = currentPathname.startsWith("/candidacies/annuaire");
  if (isPagePathAfterFirstlevel || isAnnuairePage) {
    return <>{children}</>;
  }

  const feasibilityCountByCategory =
    getFeasibilityCountAndCohortesVaeCollectivesByCategoryResponse?.feasibilityCountByCategory;

  const dossierDeValidationCountByCategory =
    getDossierDeValidationCountByCategoryResponse?.dossierDeValidation_dossierDeValidationCountByCategory;

  const juryCountByCategory =
    getJuryCountByCategoryResponse?.jury_juryCountByCategory;

  const cohortesVaeCollectives =
    getFeasibilityCountAndCohortesVaeCollectivesByCategoryResponse?.cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount ||
    [];

  const feasibilityItems = [
    menuItem({
      text: `Tous les dossiers actifs (${feasibilityCountByCategory?.ALL || 0})`,
      path: "/candidacies/feasibilities",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Nouveaux dossiers (${feasibilityCountByCategory?.PENDING || 0})`,
      path: "/candidacies/feasibilities",
      category: "PENDING",
    }),
    menuItem({
      text: `Dossiers incomplets (${feasibilityCountByCategory?.INCOMPLETE || 0})`,
      path: "/candidacies/feasibilities",
      category: "INCOMPLETE",
    }),
    menuItem({
      text: `Dossiers en attente de recevabilité (${feasibilityCountByCategory?.COMPLETE || 0})`,
      path: "/candidacies/feasibilities",
      category: "COMPLETE",
    }),
    menuItem({
      text: `Dossiers recevables (${feasibilityCountByCategory?.ADMISSIBLE || 0})`,
      path: "/candidacies/feasibilities",
      category: "ADMISSIBLE",
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

  const juryCount =
    (juryCountByCategory?.SCHEDULED || 0) + (juryCountByCategory?.PASSED || 0);

  const juryItems = [
    menuItem({
      text: `Tous les jurys (${juryCount})`,
      path: "/candidacies/juries",
      category: "ALL",
      defaultMenuItem: true,
    }),
    menuItem({
      text: `Jurys programmés (${juryCountByCategory?.SCHEDULED || 0})`,
      path: "/candidacies/juries",
      category: "SCHEDULED",
    }),
    menuItem({
      text: `Jurys passés (${juryCountByCategory?.PASSED || 0})`,
      path: "/candidacies/juries",
      category: "PASSED",
    }),
  ];

  const cohorteVaeCollectiveSelected = !!searchParams.get(
    "cohorteVaeCollectiveId",
  );
  const vaeCollectiveItems: SideMenuProps["items"] = [
    {
      text: `VAE collective (${feasibilityCountByCategory?.VAE_COLLECTIVE || 0})`,
      linkProps: { href: "/candidacies/feasibilities?CATEGORY=VAE_COLLECTIVE" },
      isActive:
        searchParams.get("CATEGORY") === "VAE_COLLECTIVE" &&
        !cohorteVaeCollectiveSelected,
      ...(!!cohortesVaeCollectives.length
        ? {
            items: cohortesVaeCollectives.map((cohorteVaeCollective) => ({
              text: cohorteVaeCollective.nom,
              isActive:
                searchParams.get("CATEGORY") === "VAE_COLLECTIVE" &&
                searchParams.get("cohorteVaeCollectiveId") ===
                  cohorteVaeCollective.id,
              linkProps: {
                href: hrefSideMenu(
                  "/candidacies/feasibilities",
                  "VAE_COLLECTIVE",
                  {
                    cohorteVaeCollectiveId: cohorteVaeCollective.id,
                  },
                ),
              },
            })),
          }
        : {}),
    },
  ];

  const menuItems = [
    {
      items: feasibilityItems,
      text: `Dossiers de faisabilité (${feasibilityCountByCategory?.ALL || 0})`,
      expandedByDefault:
        currentPathname.startsWith("/candidacies/feasibilities") &&
        searchParams.get("CATEGORY") != "REJECTED" &&
        searchParams.get("CATEGORY") != "DROPPED_OUT" &&
        searchParams.get("CATEGORY") != "ARCHIVED" &&
        searchParams.get("CATEGORY") != "VAE_COLLECTIVE",
    },
    {
      items: dossierDeValidationItems,
      text: `Dossiers de validation (${dossierDeValidationCountByCategory?.ALL || 0})`,
      expandedByDefault: currentPathname.startsWith(
        "/candidacies/dossiers-de-validation",
      ),
    },
    {
      items: juryItems,
      text: `Jurys (${juryCount})`,
      expandedByDefault: currentPathname.startsWith("/candidacies/juries"),
    },
    ...vaeCollectiveItems,
    menuItem({
      text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED || 0})`,
      path: "/candidacies/feasibilities",
      category: "REJECTED",
    }),
    menuItem({
      text: `Dossiers abandonnés (${feasibilityCountByCategory?.DROPPED_OUT || 0})`,
      path: "/candidacies/feasibilities",
      category: "DROPPED_OUT",
    }),
    menuItem({
      text: `Dossiers supprimés (${feasibilityCountByCategory?.ARCHIVED || 0})`,
      path: "/candidacies/feasibilities",
      category: "ARCHIVED",
    }),
  ];

  return (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <nav
        role="navigation"
        aria-label="Menu latéral"
        className="flex flex-col gap-4 md:basis-[400px]"
      >
        {isAdmin && certificationAuthorityId && (
          <div className="mr-8">
            <CertificationAuthority
              certificationAuthorityId={certificationAuthorityId}
            />
          </div>
        )}
        {(isAdmin || isAdminCertificationAuthority) &&
          certificationAuthorityLocalAccountId && (
            <div className="mr-8">
              <CertificationAuthorityLocalAccount
                certificationAuthorityLocalAccountId={
                  certificationAuthorityLocalAccountId
                }
              />
            </div>
          )}
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
          align="left"
          burgerMenuButtonText="Candidatures"
          sticky
          fullHeight
          items={menuItems}
        />
      </nav>

      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
};

export default CandidaciesLayout;
