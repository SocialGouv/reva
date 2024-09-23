"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const getValidatedSubscriptionRequests = graphql(`
  query getValidatedSubscription($offset: Int, $searchFilter: String) {
    organism_getMaisonMereAAPs(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
      legalValidationStatus: A_METTRE_A_JOUR
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

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

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
    subscriptionRequestPage &&
    getValidatedSubscriptionRequestsStatus === "success" && (
      <SearchList
        title="Comptes administrateur incomplets"
        searchFilter={searchFilter}
        searchResultsPage={subscriptionRequestPage}
      >
        {(r) => (
          <SubscriptionRequestCard
            key={r.id}
            companyName={r.raisonSociale}
            createdAtLabel="Date de validation de l'inscription"
            createdAt={new Date(r.createdAt)}
            href={`/maisonMereAAPs/${r.id}`}
          />
        )}
      </SearchList>
    )
  );
};

export default ValidatedSubscriptionRequestsPage;
