"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { JuryCategoryFilter } from "@/graphql/generated/graphql";

import { CandidacySearchList } from "../(components)/CandidacySearchList";

const RECORDS_PER_PAGE = 10;

const getJuriesQuery = graphql(`
  query getJuries(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: JuryCategoryFilter
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
  ) {
    jury_getJuries(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      rows {
        id
        candidacy {
          id
          typeAccompagnement
          certification {
            codeRncp
            label
          }
          candidate {
            firstname
            lastname
            department {
              label
              code
            }
          }
          status
          candidacyStatuses {
            status
            createdAt
          }
          candidacyDropOut {
            createdAt
          }
          jury {
            dateOfSession
            result
          }
          cohorteVaeCollective {
            nom
            commanditaireVaeCollective {
              raisonSociale
            }
          }
        }
        dateOfSession
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const JuriesPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const certificationAuthorityId = searchParams.get(
    "certificationAuthorityId",
  ) as string | undefined;
  const certificationAuthorityLocalAccountId = searchParams.get(
    "certificationAuthorityLocalAccountId",
  ) as string | undefined;

  const category = searchParams.get("CATEGORY");

  const { replace } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("CATEGORY", category || "ALL");
    params.set("page", page || "1");

    if (!page || !category) {
      replace(`${currentPathname}?${params.toString()}`);
    }
  }, [replace, page, category, currentPathname]);

  const { isAdmin } = useAuth();

  const { data: getJuriesResponse } = useQuery({
    queryKey: [
      "getJuries",
      searchFilter,
      currentPage,
      category,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getJuriesQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        categoryFilter: (category === null || category === "ALL"
          ? undefined
          : category) as JuryCategoryFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
      }),
  });

  const juryPage = getJuriesResponse?.jury_getJuries;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "ALL":
        return "Tous les jurys";
      case "SCHEDULED":
        return "Jurys programmés";
      case "PASSED":
        return "Jurys passés";
      default:
        return category;
    }
  }, [category]);

  const getPathnameWithoutCertificationAuthorityId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("certificationAuthorityId");
    return `${currentPathname}?${currentParams.toString()}`;
  };

  const getPathnameWithoutCertificationAuthorityLocalAccountId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("certificationAuthorityLocalAccountId");
    return `${currentPathname}?${currentParams.toString()}`;
  };

  return (
    juryPage && (
      <div className="flex flex-col">
        {isAdmin ? (
          <>
            {certificationAuthorityId && (
              <div>
                <h1>Candidatures de la structure</h1>
                <Button
                  priority="secondary"
                  linkProps={{
                    href: getPathnameWithoutCertificationAuthorityId(),
                  }}
                >
                  Accéder à toutes les candidatures
                </Button>
                <p className="mt-6">
                  Ici, vous pouvez rechercher une ou plusieurs candidatures
                  gérées par cette structure. Pour retrouver toutes les
                  candidatures de la plateforme, cliquez sur “Accéder à toutes
                  les candidatures”.
                </p>
              </div>
            )}

            {certificationAuthorityLocalAccountId && (
              <div>
                <h1>Candidatures du compte collaborateur</h1>
                <Button
                  priority="secondary"
                  linkProps={{
                    href: getPathnameWithoutCertificationAuthorityLocalAccountId(),
                  }}
                >
                  Accéder à toutes les candidatures
                </Button>
                <p className="mt-6">
                  Ici, vous pouvez rechercher une ou plusieurs candidatures
                  gérées par ce compte collaborateur. Pour retrouver toutes les
                  candidatures de la plateforme, cliquez sur “Accéder à toutes
                  les candidatures”.
                </p>
              </div>
            )}

            {!certificationAuthorityId &&
              !certificationAuthorityLocalAccountId && <h1>Jurys</h1>}
          </>
        ) : (
          <h1>Jurys</h1>
        )}

        <CandidacySearchList
          title={categoryLabel}
          searchFilter={searchFilter}
          searchResultsPage={juryPage}
          searchResultLink={(candidacyId) => `/candidacies/${candidacyId}/jury`}
        />
      </div>
    )
  );
};

export default JuriesPage;
