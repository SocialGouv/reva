"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
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
  const params = useSearchParams();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;

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
          <>
            <h4 className="text-2xl font-bold mb-6">
              Autorités responsable de la recevabilité (
              {certificationAuthorityPage.info.totalRows})
            </h4>

            <SearchFilterBar
              className="mb-6"
              searchFilter={searchFilter}
              resultCount={certificationAuthorityPage.info.totalRows}
              onSearchFilterChange={setSearchFilter}
            />
            <ul className="flex flex-col gap-5">
              {certificationAuthorityPage?.rows.map((c) => (
                <GrayCard key={c.id}>
                  <strong>Nom de l'autorité de certification</strong>
                  <p>{c.label}</p>
                  <br />
                </GrayCard>
              ))}
            </ul>
          </>
        )}
        <br />
        <Pagination
          totalPages={certificationAuthorityPage.info.totalPages}
          currentPage={currentPage}
          baseHref="/certification-authorities"
          className="mx-auto"
        />
      </div>
    )
  );
};

export default CertificationAuthoritiesListPage;