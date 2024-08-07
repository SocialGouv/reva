"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { FeasibilityCategoryFilter } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";

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

  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

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

  const { data: getFeasibilitiesResponse } = useQuery({
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
        {!isAdmin && <h1>Espace certificateur</h1>}
        <CandidacySearchList
          title={categoryLabel}
          searchFilter={searchFilter}
          searchResultsPage={feasibilityPage}
          searchResultLink={(candidacyId) =>
            `/candidacies/${candidacyId}/feasibility`
          }
        >
          {(r) =>
            r.feasibilityFileSentAt && (
              <p className="text-lg col-span-2 mb-0">
                Dossier envoyé le{" "}
                {format(r.feasibilityFileSentAt as any as Date, "d MMM yyyy")}
              </p>
            )
          }
        </CandidacySearchList>
      </div>
    )
  );
};

export default RejectedSubscriptionRequestsPage;
