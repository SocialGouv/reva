"use client";
import { SubscriptionRequestCard } from "@/app/(admin)/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

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
