"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const getCertificationAuthorities = graphql(`
  query getCertificationAuthorities($offset: Int, $searchFilter: String) {
    certification_authority_searchCertificationAuthoritiesAndLocalAccounts(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        label
        email
        type
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
    getCertificationAuthoritiesResponse?.certification_authority_searchCertificationAuthoritiesAndLocalAccounts;
  return (
    certificationAuthorityPage && (
      <div className="flex flex-col flex-1">
        <h1>Espace pro administrateur</h1>
        {getCertificationAuthoritiesStatus === "success" && (
          <SearchList
            title="Certificateurs"
            searchFilter={searchFilter}
            searchResultsPage={certificationAuthorityPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(c) => (
              <GrayCard key={c.id} className="gap-4">
                <span className="flex items-center gap-2">
                  <span className="font-bold">{c.label}</span>
                  {c.type === "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT" ? (
                    <Tag small className="bg-yellow-200 font-bold">
                      Compte local
                    </Tag>
                  ) : null}
                </span>
                <p>{c.email}</p>
                <Button
                  className="ml-auto"
                  linkProps={{
                    href:
                      c.type === "CERTIFICATION_AUTHORITY"
                        ? `/certification-authorities/${c.id}`
                        : `/certification-authorities/local-account/${c.id}`,
                  }}
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
