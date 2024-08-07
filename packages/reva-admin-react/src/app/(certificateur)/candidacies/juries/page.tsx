"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { JuryCategoryFilter } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";
import { format } from "date-fns";

const RECORDS_PER_PAGE = 10;

const getJuriesQuery = graphql(`
  query getJuries(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: JuryCategoryFilter
  ) {
    jury_getJuries(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        candidacy {
          id
          certification {
            label
          }
          candidate {
            firstname
            lastname
          }
          department {
            label
            code
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
    queryKey: ["getJuries", searchFilter, currentPage, category],
    queryFn: () =>
      graphqlClient.request(getJuriesQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        categoryFilter: (category === null || category === "ALL"
          ? undefined
          : category) as JuryCategoryFilter,
      }),
  });

  const juryPage = getJuriesResponse?.jury_getJuries;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "SCHEDULED":
        return "Programmés";
      case "PASSED":
        return "Passés";
      default:
        return "Tous les jurys";
    }
  }, [category]);
  return (
    juryPage && (
      <div className="flex flex-col">
        {!isAdmin && <h1>Espace certificateur</h1>}
        <CandidacySearchList
          title={categoryLabel}
          searchFilter={searchFilter}
          searchResultsPage={juryPage}
          searchResultLink={(candidacyId) => `/candidacies/${candidacyId}/jury`}
        >
          {(r) => (
            <p className="text-lg col-span-2 mb-0">
              Jury programmé le {format(r?.dateOfSession, "d MMM yyyy")}
            </p>
          )}
        </CandidacySearchList>
      </div>
    )
  );
};

export default JuriesPage;
