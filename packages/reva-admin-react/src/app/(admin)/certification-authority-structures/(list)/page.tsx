"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { SearchList } from "@/components/search/search-list/SearchList";

const getCertificationAuthorityStructures = graphql(`
  query getCertificationAuthorityStructures(
    $offset: Int
    $searchFilter: String
  ) {
    certification_authority_getCertificationAuthorityStructures(
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

const CertificationAuthorityStructuresListPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const {
    data: getCertificationAuthorityStructuresResponse,
    status: getCertificationAuthorityStructuresStatus,
  } = useQuery({
    queryKey: [
      "getCertificationAuthorityStructures",
      searchFilter,
      currentPage,
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructures, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  if (getCertificationAuthorityStructuresStatus === "pending") {
    return (
      <div className="flex flex-col flex-1">
        <h1>Structures certificatrices</h1>
        <p>Chargement des structures certificatrices...</p>
      </div>
    );
  }

  const certificationAuthorityStructuresPage =
    getCertificationAuthorityStructuresResponse?.certification_authority_getCertificationAuthorityStructures;
  return (
    certificationAuthorityStructuresPage && (
      <div className="flex flex-col flex-1">
        <h1>Structures certificatrices</h1>
        {getCertificationAuthorityStructuresStatus === "success" && (
          <SearchList
            searchResultsPage={certificationAuthorityStructuresPage}
            searchFilter={searchFilter}
            searchBarProps={{
              placeholder:
                "Rechercher par nom de certificateur, nom ou email de collaborateur, région, département...",
            }}
          >
            {(c) => (
              <Card
                key={c.id}
                enlargeLink
                title={c.label}
                linkProps={{
                  href: `/certification-authority-structures/${c.id}`,
                }}
              />
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default CertificationAuthorityStructuresListPage;
