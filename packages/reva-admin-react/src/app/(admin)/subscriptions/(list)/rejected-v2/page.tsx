"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
      graphqlClient.request(getRejectedSubscriptionRequestV2s, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getRejectedSubscriptionRequestsResponse?.subscription_getSubscriptionRequestV2s;
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
            title="Inscriptions en attente"
            searchFilter={searchFilter}
            searchResultsPage={subscriptionRequestPage}
            updateSearchFilter={updateSearchFilter}
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
        )}
      </div>
    )
  );
};

export default RejectedSubscriptionRequestV2sPage;
