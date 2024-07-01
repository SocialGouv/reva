"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const getRejectedSubscriptionRequestV2s = graphql(`
  query getRejectedSubscriptionRequestV2s($offset: Int, $searchFilter: String) {
    subscription_getSubscriptionRequestV2s(
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

const RejectedSubscriptionRequestV2sPage = () => {
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
      graphqlClient.request(getRejectedSubscriptionRequestV2s, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getRejectedSubscriptionRequestsResponse?.subscription_getSubscriptionRequestV2s;
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
            createdAt={new Date(r.createdAt)}
            href={`/subscriptions/v2/${r.id}`}
          />
        )}
      </SearchList>
    )
  );
};

export default RejectedSubscriptionRequestV2sPage;
