"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { CertificationAuthority } from "./(components)/CertificationAuthority";
import { useAuth } from "@/components/auth/auth";

const getFeasibilityCountByCategoryQuery = graphql(`
  query getFeasibilityCountByCategory(
    $searchFilter: String
    $certificationAuthorityId: ID
  ) {
    feasibilityCountByCategory(
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
    ) {
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

  const { isAdmin } = useAuth();

  const { graphqlClient } = useGraphQlClient();

  const { data: getFeasibilityCountByCategoryResponse } = useQuery({
    queryKey: [
      "getFeasibilityCountByCategory",
      searchFilter,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getFeasibilityCountByCategoryQuery, {
        searchFilter,
        certificationAuthorityId,
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
      <nav
        role="navigation"
        aria-label="Menu latéral"
        className="flex flex-col gap-4"
      >
        {isAdmin && certificationAuthorityId && (
          <CertificationAuthority
            certificationAuthorityId={certificationAuthorityId}
          />
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
