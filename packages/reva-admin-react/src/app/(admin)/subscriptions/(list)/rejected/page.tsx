"use client";
import { useQuery } from "@tanstack/react-query";
import { toDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";

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

const RECORDS_PER_PAGE = 10;

const RejectedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const {
    data: getRejectedSubscriptionRequestsResponse,
    status: getRejectedSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: ["getRejectedSubscriptionRequests", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getRejectedSubscriptionRequests, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getRejectedSubscriptionRequestsResponse?.subscription_getSubscriptionRequests;
  return (
    subscriptionRequestPage &&
    getRejectedSubscriptionRequestsStatus === "success" && (
      <SearchList
        title="Inscriptions refusées"
        searchFilter={searchFilter}
        searchResultsPage={subscriptionRequestPage}
      >
        {(r) => (
          <SubscriptionRequestCard
            key={r.id}
            companyName={r.companyName}
            createdAtLabel="Date d'envoi de l'inscription"
            createdAt={toDate(r.createdAt)}
            href={`/subscriptions/${r.id}`}
          />
        )}
      </SearchList>
    )
  );
};

export default RejectedSubscriptionRequestsPage;
