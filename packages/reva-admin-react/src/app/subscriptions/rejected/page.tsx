"use client";
import { SubscriptionRequestCard } from "@/app/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const getRejectedSubscriptionRequests = graphql(`
  query getRejectedSubscriptionRequests($offset: Int, $searchFilter: String) {
    subscription_getSubscriptionRequests(
      status: REJECTED
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        companyName
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

const RejectedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const [searchFilter, setSearchFilter] = useState("");

  const {
    data: getRejectedSubscriptionRequestsResponse,
    status: getRejectedSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: ["getRejectedSubscriptionRequests", { searchFilter }],
    queryFn: () =>
      graphqlClient.request(getRejectedSubscriptionRequests, {
        offset: 0,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getRejectedSubscriptionRequestsResponse?.subscription_getSubscriptionRequests;
  return (
    <div className="flex flex-col">
      <PageTitle>Espace pro administrateur</PageTitle>
      <p>
        En tant qu'administrateur des conseillers, vous avez la possibilité
        d'ajouter ou d'accepter de nouveaux architecte de parcours ou
        certificateur.
      </p>
      <br />
      {getRejectedSubscriptionRequestsStatus === "success" && (
        <>
          <h4 className="text-2xl font-bold mb-6">
            Inscriptions refusées ({subscriptionRequestPage?.info.totalRows})
          </h4>

          <SearchFilterBar
            className="mb-6"
            searchFilter={searchFilter}
            resultCount={subscriptionRequestPage?.info.totalRows || 0}
            onSearchFilterChange={setSearchFilter}
          />

          <ul className="flex flex-col gap-5">
            {subscriptionRequestPage?.rows.map((r) => (
              <SubscriptionRequestCard
                key={r.id}
                companyName={r.companyName}
                createdAt={r.createdAt}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default RejectedSubscriptionRequestsPage;
