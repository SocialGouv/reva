"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const getCertificationAuthorities = graphql(`
  query getCertificationAuthorities($offset: Int, $searchFilter: String) {
    certification_authority_getCertificationAuthorities(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        label
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

const CertificationAuthoritiesListPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const [searchFilter, setSearchFilter] = useState("");
  const pathname = usePathname();
  const params = useSearchParams();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const router = useRouter();

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

  const {
    data: getCertificationAuthoritiesResponse,
    status: getCertificationAuthoritiesStatus,
  } = useQuery({
    queryKey: ["getCertificationAuthorities", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorities, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  const certificationAuthorityPage =
    getCertificationAuthoritiesResponse?.certification_authority_getCertificationAuthorities;
  return (
    certificationAuthorityPage && (
      <div className="flex flex-col flex-1">
        <PageTitle>Espace pro administrateur</PageTitle>
        <br />
        {getCertificationAuthoritiesStatus === "success" && (
          <SearchList
            title="Certificateurs"
            searchFilter={searchFilter}
            searchResultsPage={certificationAuthorityPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(c) => (
              <GrayCard key={c.id}>
                <strong>Nom</strong>
                <p>{c.label}</p>
                <Button
                  className="ml-auto"
                  linkProps={{ href: `/certification-authorities/${c.id}` }}
                >
                  Voir plus
                </Button>
              </GrayCard>
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default CertificationAuthoritiesListPage;