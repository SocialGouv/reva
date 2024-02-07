"use client";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const getCertificationsQuery = graphql(`
  query getCertificationsForListPage($offset: Int, $searchFilter: String) {
    getCertifications(limit: 10, offset: $offset, searchText: $searchFilter) {
      rows {
        id
        label
        codeRncp
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
const CertificationListPage = () => {
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

  const { data: getCertificationsResponse, status: getCertificationsStatus } =
    useQuery({
      queryKey: ["getCertifications", searchFilter, currentPage],
      queryFn: () =>
        graphqlClient.request(getCertificationsQuery, {
          offset: (currentPage - 1) * RECORDS_PER_PAGE,
          searchFilter,
        }),
    });

  const certificationPage = getCertificationsResponse?.getCertifications;
  return (
    certificationPage && (
      <div className="flex flex-col">
        <PageTitle>Espace pro administrateur</PageTitle>
        <br />
        {getCertificationsStatus === "success" && (
          <SearchList
            title="Toutes les certifications"
            searchFilter={searchFilter}
            searchResultsPage={certificationPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(r) => (
              <WhiteCard key={r.id}>
                <span className="text-gray-500 text-sm">{r.codeRncp}</span>
                <span className="text-lg font-bold">{r.label}</span>
              </WhiteCard>
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default CertificationListPage;
