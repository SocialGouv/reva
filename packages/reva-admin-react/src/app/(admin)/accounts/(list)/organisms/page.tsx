"use client";
import { Card } from "@/app/(admin)/accounts/components/card/Card";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const getAccountsWithOrganism = graphql(`
  query getAccountsWithOrganism($offset: Int, $searchFilter: String) {
    account_getAccounts(
      groupFilter: organism
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        email
        organism {
          id
          label
        }
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
const OrganismsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const { data, status } = useQuery({
    queryKey: ["getAccountsWithOrganism", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getAccountsWithOrganism, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  return (
    data && (
      <div className="flex flex-col">
        <h1>Espace pro administrateur</h1>
        <p>
          En tant qu'administrateur, vous avez la possibilité de modifier les
          informations des comptes utilisateurs et des structures.
        </p>
        {status === "success" && (
          <SearchList
            title="Compte AAP"
            searchFilter={searchFilter}
            searchResultsPage={data.account_getAccounts}
          >
            {(account) =>
              account.organism ? (
                <Card
                  key={account.id}
                  label={account.organism.label}
                  email={account.email}
                  href={`/accounts/${account.id}`}
                />
              ) : null
            }
          </SearchList>
        )}
      </div>
    )
  );
};

export default OrganismsPage;
