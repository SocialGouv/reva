"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { FeasibilityCategoryFilter } from "@/graphql/generated/graphql";

import { CandidacySearchList } from "../(components)/CandidacySearchList";

const RECORDS_PER_PAGE = 10;

const getFeasibilitiesQuery = graphql(`
  query getFeasibilities(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: FeasibilityCategoryFilter
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
    $cohorteVaeCollectiveId: ID
  ) {
    feasibilities(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      rows {
        id
        feasibilityFileSentAt
        candidacy {
          typeAccompagnement
          organism {
            nomPublic
            label
          }
          id
          certification {
            codeRncp
            label
          }
          candidate {
            firstname
            lastname
            department {
              code
              label
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
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const FeasibilitiesPage = () => {
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

  const cohorteVaeCollectiveId = searchParams.get("cohorteVaeCollectiveId");

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

  const { data: getFeasibilitiesResponse } = useQuery({
    queryKey: [
      "getFeasibilities",
      searchFilter,
      currentPage,
      category,
      certificationAuthorityId,
      certificationAuthorityLocalAccountId,
      cohorteVaeCollectiveId,
    ],
    queryFn: () =>
      graphqlClient.request(getFeasibilitiesQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        categoryFilter: (category === null || category === "ALL"
          ? undefined
          : category) as FeasibilityCategoryFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
        cohorteVaeCollectiveId,
      }),
  });

  const feasibilityPage = getFeasibilitiesResponse?.feasibilities;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "ALL":
        return "Tous les dossiers actifs";
      case "PENDING":
        return "Nouveaux dossiers";
      case "REJECTED":
        return "Dossiers non recevables";
      case "INCOMPLETE":
        return "Dossiers incomplets";
      case "COMPLETE":
        return "Dossiers en attente de recevabilité";
      case "ADMISSIBLE":
        return "Dossiers recevables";
      case "DROPPED_OUT":
        return "Dossiers abandonnés";
      case "ARCHIVED":
        return "Dossiers supprimés";
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
    feasibilityPage && (
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
              !certificationAuthorityLocalAccountId && (
                <h1>Dossiers de faisabilité</h1>
              )}
          </>
        ) : (
          <h1>Dossiers de faisabilité</h1>
        )}

        <CandidacySearchList
          title={categoryLabel}
          searchFilter={searchFilter}
          searchResultsPage={feasibilityPage}
          searchResultLink={(candidacyId) =>
            `/candidacies/${candidacyId}/feasibility`
          }
        />
      </div>
    )
  );
};

export default FeasibilitiesPage;
