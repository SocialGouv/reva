"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const getCertificationAuthorities = graphql(`
  query getCertificationAuthorities($offset: Int, $searchFilter: String) {
    certification_authority_searchCertificationAuthoritiesAndLocalAccounts(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        certificationAuthorityId
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

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

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
                        : `/certification-authorities/${c.certificationAuthorityId}/local-account/${c.id}`,
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
