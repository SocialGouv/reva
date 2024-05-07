"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
    data: getLegalVerificationPendingSubscriptionRequestsResponse,
    status: getLegalVerificationPendingSubscriptionRequestsStatus,
  } = useQuery({
    queryKey: ["getLegalVerificationPendingSubscriptionRequests", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getLegalVerificationPendingSubscriptionRequests, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const subscriptionRequestPage =
    getLegalVerificationPendingSubscriptionRequestsResponse?.organism_getMaisonMereAAPs;
  return (
    subscriptionRequestPage && (
      <div className="flex flex-col">
        <h1>Espace pro administrateur</h1>
        <p>
          En tant qu'administrateur des conseillers, vous avez la possibilité
          d'ajouter ou d'accepter de nouveaux architecte de parcours ou
          certificateur.
        </p>
        {getLegalVerificationPendingSubscriptionRequestsStatus === "success" && (
          <SearchList
            title="Inscriptions validées"
            searchFilter={searchFilter}
            searchResultsPage={subscriptionRequestPage}
            updateSearchFilter={updateSearchFilter}
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
        )}
      </div>
    )
  );
};

export default ValidatedSubscriptionRequestsPage;
