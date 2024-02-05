"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { graphql } from "@/graphql/generated";
import {
  FeasibilityCategoryFilter,
  FeasibilityPage,
} from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";
import { useSearchFilterFeasibilitiesStore } from "../(components)/useSearchFilterFeasibilitiesStore";

const RECORDS_PER_PAGE = 10;

const getFeasibilitiesQuery = graphql(`
  query getFeasibilities(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: FeasibilityCategoryFilter
  ) {
    feasibilities(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        feasibilityFileSentAt
        candidacy {
          id
          department {
            code
            label
          }
          certification {
            label
          }
          candidate {
            firstname
            lastname
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

const RejectedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { searchFilter, setSearchFilter } = useSearchFilterFeasibilitiesStore();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = params.get("page");
  const category = params.get("CATEGORY");
  const currentPage = page ? Number.parseInt(page) : 1;
  const { isAdmin } = useAuth();

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(`${pathname}?CATEGORY=${category || "ALL"}`);
  };

  const { data: getFeasibilitiesResponse, status: getFeasibilitiesStatus } =
    useQuery({
      queryKey: ["getFeasibilities", searchFilter, currentPage, category],
      queryFn: () =>
        graphqlClient.request(getFeasibilitiesQuery, {
          offset: (currentPage - 1) * RECORDS_PER_PAGE,
          limit: RECORDS_PER_PAGE,
          searchFilter,
          categoryFilter: (category === null || category === "ALL"
            ? undefined
            : category) as FeasibilityCategoryFilter,
        }),
    });

  const feasibilityPage = getFeasibilitiesResponse?.feasibilities;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "PENDING":
        return "Dossiers en attente de recevabilité";
      case "ADMISSIBLE":
        return "Dossiers recevables";
      case "REJECTED":
        return "Dossiers non recevables";
      case "INCOMPLETE":
        return "Dossiers incomplets";
      default:
        return "Tous les dossiers de faisabilité";
    }
  }, [category]);
  return (
    feasibilityPage && (
      <div className="flex flex-col">
        {!isAdmin && <PageTitle>Espace certificateur</PageTitle>}
        <CandidacySearchList
          categoryLabel={categoryLabel}
          searchFilter={searchFilter}
          updateSearchFilter={updateSearchFilter}
          searchResults={feasibilityPage as FeasibilityPage}
          currentPage={currentPage}
          searchResultLink={(searchResultCandidacyId) =>
            `/candidacies/${searchResultCandidacyId}/feasibility`
          }
        />
      </div>
    )
  );
};

export default RejectedSubscriptionRequestsPage;
