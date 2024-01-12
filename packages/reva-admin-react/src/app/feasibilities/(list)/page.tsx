"use client";
import { useAuth } from "@/components/auth/auth";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { graphql } from "@/graphql/generated";
import { FeasibilityDecisionFilter } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const RECORDS_PER_PAGE = 10;

const getFeasibilitiesQuery = graphql(`
  query getFeasibilities(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $decision: FeasibilityDecisionFilter
  ) {
    feasibilities(
      decision: $decision
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        feasibilityFileSentAt
        candidacy {
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
  const [searchFilter, setSearchFilter] = useState("");
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = params.get("page");
  const category = params.get("CATEGORY");
  const currentPage = page ? Number.parseInt(page) : 1;
  const { isAdmin } = useAuth();

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

  const { data: getFeasibilitiesResponse, status: getFeasibilitiesStatus } =
    useQuery({
      queryKey: ["getFeasibilities", searchFilter, currentPage, category],
      queryFn: () =>
        graphqlClient.request(getFeasibilitiesQuery, {
          offset: (currentPage - 1) * RECORDS_PER_PAGE,
          limit: RECORDS_PER_PAGE,
          searchFilter,
          decision: (category === null || category === "ALL"
            ? undefined
            : category) as FeasibilityDecisionFilter,
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
        {getFeasibilitiesStatus === "success" && (
          <>
            <h4 className="text-3xl font-bold mb-6">{categoryLabel}</h4>

            <SearchFilterBar
              className="mb-6"
              searchFilter={searchFilter}
              resultCount={feasibilityPage.info.totalRows}
              onSearchFilterChange={updateSearchFilter}
            />

            <ul className="flex flex-col gap-5">
              {feasibilityPage.rows.map((f) => (
                <WhiteCard key={f.id} className="grid grid-cols-2 gap-2">
                  <h3 className="text-xl font-semibold col-span-2">
                    {f.candidacy.certification?.label}
                  </h3>

                  <p className="text-lg uppercase">
                    {f.candidacy.candidate?.firstname}{" "}
                    {f.candidacy.candidate?.lastname}
                  </p>
                  <p className="text-lg">
                    {f.candidacy.department?.label} (
                    {f.candidacy.department?.code})
                  </p>
                  <p className="text-lg col-span-2">
                    Dossier envoyé le{" "}
                    {format(f.feasibilityFileSentAt, "d MMM yyyy")}
                  </p>
                  <Button
                    className="ml-auto col-start-2"
                    onClick={() => router.push(`/feasibilities/${f.id}`)}
                  >
                    Accéder au dossier
                  </Button>
                </WhiteCard>
              ))}
            </ul>
          </>
        )}
        <br />
        <Pagination
          totalPages={feasibilityPage.info.totalPages}
          currentPage={currentPage}
          baseHref={`/feasibilities`}
          baseParams={{ CATEGORY: category || "ALL" }}
          className="mx-auto"
        />
      </div>
    )
  );
};

export default RejectedSubscriptionRequestsPage;
