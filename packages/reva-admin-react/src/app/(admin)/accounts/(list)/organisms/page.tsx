"use client";
import { Card } from "@/app/(admin)/accounts/components/card/Card";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
        <PageTitle>Espace pro administrateur</PageTitle>
        <p>
          En tant qu'administrateur, vous avez la possibilité de modifier les
          informations des comptes utilisateurs et des structures.
        </p>
        <br />
        {status === "success" && (
          <SearchList
            title="Compte certificateurs"
            searchFilter={searchFilter}
            searchResultsPage={data.account_getAccounts}
            updateSearchFilter={updateSearchFilter}
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
