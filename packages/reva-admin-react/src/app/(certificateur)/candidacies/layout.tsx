"use client";
import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { CertificationAuthority } from "./(components)/CertificationAuthority";
import { CertificationAuthorityLocalAccount } from "./(components)/CertificationAuthorityLocalAccount";

const getFeasibilityCountByCategoryQuery = graphql(`
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
      CADUQUE
      CONTESTATION
    }
  }
`);

const getDossierDeValidationCountByCategoryQuery = graphql(`
  query getDossierDeValidationCountByCategory(
    $searchFilter: String
    $certificationAuthorityId: ID
  ) {
    dossierDeValidation_dossierDeValidationCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
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
  ) {
    jury_juryCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
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

  const { isAdmin } = useAuth();

  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureflipping();
  const isCandidacyActualisationActive = isFeatureActive(
    "candidacy_actualisation",
  );

  const { data: getFeasibilityCountByCategoryResponse } = useQuery({
    queryKey: [
      "feasibilities",
      "getFeasibilityCountByCategory",
      searchFilter,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getFeasibilityCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
      }),
  });

  const { data: getDossierDeValidationCountByCategoryResponse } = useQuery({
    queryKey: [
      "getDossierDeValidationCountByCategory",
      searchFilter,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
      }),
  });

  const { data: getJuryCountByCategoryResponse } = useQuery({
    queryKey: [
      "getJuryCountByCategory",
      searchFilter,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getJuryCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
      }),
  });

  const hrefSideMenu = (path: string, category: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("CATEGORY", category);

    if (searchFilter) {
      params.set("search", searchFilter);
    }
    if (certificationAuthorityId) {
      params.set("certificationAuthorityId", certificationAuthorityId);
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

  const menuItems = [
    {
      items: feasibilityItems,
      text: `Dossiers de faisabilité (${feasibilityCountByCategory?.ALL || 0})`,
      expandedByDefault:
        currentPathname.startsWith("/candidacies/feasibilities") &&
        searchParams.get("CATEGORY") != "REJECTED" &&
        searchParams.get("CATEGORY") != "DROPPED_OUT" &&
        searchParams.get("CATEGORY") != "ARCHIVED",
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
    menuItem({
      text: `Dossiers non recevables (${feasibilityCountByCategory?.REJECTED || 0})`,
      path: "/candidacies/feasibilities",
      category: "REJECTED",
    }),
    ...(isCandidacyActualisationActive
      ? [
          menuItem({
            text: `Recevabilités caduques (${feasibilityCountByCategory?.CADUQUE || 0})`,
            path: "/candidacies/caducites",
            category: "CADUQUE",
          }),
          menuItem({
            text: `Contestations caducité (${feasibilityCountByCategory?.CONTESTATION || 0})`,
            path: "/candidacies/caducites",
            category: "CONTESTATION",
          }),
        ]
      : []),
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
        {isAdmin && (
          <>
            {certificationAuthorityId && (
              <div className="mr-8">
                <CertificationAuthority
                  certificationAuthorityId={certificationAuthorityId}
                />
              </div>
            )}
            {certificationAuthorityLocalAccountId && (
              <div className="mr-8">
                <CertificationAuthorityLocalAccount
                  certificationAuthorityLocalAccountId={
                    certificationAuthorityLocalAccountId
                  }
                />
              </div>
            )}
          </>
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
