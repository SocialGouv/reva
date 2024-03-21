"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const RECORDS_PER_PAGE = 10;
const RejectedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const [searchFilter, setSearchFilter] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

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
    subscriptionRequestPage && (
      <div className="flex flex-col">
        <h1>Espace pro administrateur</h1>
        <p>
          En tant qu'administrateur des conseillers, vous avez la possibilité
          d'ajouter ou d'accepter de nouveaux architecte de parcours ou
          certificateur.
        </p>
        {getRejectedSubscriptionRequestsStatus === "success" && (
          <SearchList
            title="Inscriptions refusées"
            searchFilter={searchFilter}
            searchResultsPage={subscriptionRequestPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(r) => (
              <SubscriptionRequestCard
                key={r.id}
                companyName={r.companyName}
                createdAt={new Date(r.createdAt)}
                href={`/subscriptions/${r.id}`}
              />
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default RejectedSubscriptionRequestsPage;
