"use client";
import { SubscriptionRequestCard } from "@/app/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const getPendingSubscriptionRequests = graphql(`
  query getPendingSubscriptionRequests($offset: Int, $searchFilter: String) {
    subscription_getSubscriptionRequests(
      status: PENDING
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

const PendingSubscriptionRequestsPage = () => {
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
    data: getPendingSubscriptionRequestsResponse,
    status: getPendingSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: ["getPendingSubscriptionRequests", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getPendingSubscriptionRequests, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getPendingSubscriptionRequestsResponse?.subscription_getSubscriptionRequests;
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
        {getPendingSubscriptionRequestsStatus === "success" && (
          <SearchList
            title="Inscriptions en attente"
            currentPage={currentPage}
            totalPages={subscriptionRequestPage.info.totalPages}
            searchFilter={searchFilter}
            searchResultsTotal={subscriptionRequestPage.info.totalRows}
            updateSearchFilter={updateSearchFilter}
          >
            {subscriptionRequestPage?.rows.map((r) => (
              <SubscriptionRequestCard
                key={r.id}
                companyName={r.companyName}
                createdAt={r.createdAt}
                href={`/subscriptions/${r.id}`}
              />
            ))}
          </SearchList>
        )}
      </div>
    )
  );
};

export default PendingSubscriptionRequestsPage;
