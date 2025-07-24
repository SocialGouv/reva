"use client";
import { useQuery } from "@tanstack/react-query";
import { toDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";

const getLegalVerificationPendingSubscriptionRequests = graphql(`
  query getUpToDateMaisonMereAAPs($offset: Int, $searchFilter: String) {
    organism_getMaisonMereAAPs(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
      legalValidationStatus: A_JOUR
    ) {
      rows {
        id
        raisonSociale
        createdAt
        statutValidationInformationsJuridiquesMaisonMereAAP
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
    data: getLegalVerificationPendingSubscriptionRequestsResponse,
    status: getLegalVerificationPendingSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: [
      "getLegalVerificationPendingSubscriptionRequests",
      searchFilter,
      currentPage,
    ],
    queryFn: () =>
      graphqlClient.request(getLegalVerificationPendingSubscriptionRequests, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getLegalVerificationPendingSubscriptionRequestsResponse?.organism_getMaisonMereAAPs;
  return (
    subscriptionRequestPage &&
    getLegalVerificationPendingSubscriptionRequestsStatus === "success" && (
      <SearchList
        title="Comptes administrateur vérifiés"
        searchFilter={searchFilter}
        searchResultsPage={subscriptionRequestPage}
      >
        {(r) => (
          <SubscriptionRequestCard
            key={r.id}
            companyName={r.raisonSociale}
            createdAtLabel="Date de validation de l'inscription"
            createdAt={toDate(r.createdAt)}
            href={`/maisonMereAAPs/${r.id}`}
          />
        )}
      </SearchList>
    )
  );
};

export default ValidatedSubscriptionRequestsPage;
