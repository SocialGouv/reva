"use client";
import { SubscriptionRequestCard } from "@/app/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import Pagination from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const getValidatedSubscriptionRequests = graphql(`
  query getMaisonMereAAPs($offset: Int, $searchFilter: String) {
    organism_getMaisonMereAAPs(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        raisonSociale
        createdAt
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const RECORDS_PER_PAGE = 10;
const ValidatedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const [searchFilter, setSearchFilter] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;

  const {
    data: getValidatedSubscriptionRequestsResponse,
    status: getValidatedSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: ["getValidatedSubscriptionRequests", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getValidatedSubscriptionRequests, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getValidatedSubscriptionRequestsResponse?.organism_getMaisonMereAAPs;
  return (
    subscriptionRequestPage && (
      <div className="flex flex-col">
        <PageTitle>Espace pro administrateur</PageTitle>
        <p>
          En tant qu'administrateur des conseillers, vous avez la possibilité
          d'ajouter ou d'accepter de nouveaux architecte de parcours ou
          certificateur.
        </p>
        <br />
        {getValidatedSubscriptionRequestsStatus === "success" && (
          <>
            <h4 className="text-2xl font-bold mb-6">
              Inscriptions validées ({subscriptionRequestPage.info.totalRows})
            </h4>

            <SearchFilterBar
              className="mb-6"
              searchFilter={searchFilter}
              resultCount={subscriptionRequestPage.info.totalRows}
              onSearchFilterChange={setSearchFilter}
            />

            <ul className="flex flex-col gap-5">
              {subscriptionRequestPage.rows.map((r) => (
                <SubscriptionRequestCard
                  key={r.id}
                  companyName={r.raisonSociale}
                  createdAt={r.createdAt}
                  onClick={() => router.push(`/maisonMereAAPs/${r.id}`)}
                />
              ))}
            </ul>
          </>
        )}
        <br />
        <Pagination
          totalPages={subscriptionRequestPage.info.totalPages}
          currentPage={currentPage}
          baseHref="/subscriptions/validated"
          className="mx-auto"
        />
      </div>
    )
  );
};

export default ValidatedSubscriptionRequestsPage;
