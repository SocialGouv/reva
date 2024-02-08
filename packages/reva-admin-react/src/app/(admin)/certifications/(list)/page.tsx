"use client";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { CertificationStatus } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
const getCertificationsQuery = graphql(`
  query getCertificationsForListPage(
    $offset: Int
    $searchFilter: String
    $status: CertificationStatus
  ) {
    getCertifications(
      limit: 10
      offset: $offset
      searchText: $searchFilter
      status: $status
    ) {
      rows {
        id
        label
        codeRncp
        status
        certificationAuthorityTag
        expiresAt
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
  const pageParam = params.get("page");
  const statusParam = params.get("status");

  const currentPage = pageParam ? Number.parseInt(pageParam) : 1;

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(`${pathname}${statusParam ? `?status=${statusParam}` : ""}`);
  };

  const {
    data: getCertificationsResponse,
    status: getCertificationsQueryStatus,
  } = useQuery({
    queryKey: ["getCertifications", searchFilter, currentPage, statusParam],
    queryFn: () =>
      graphqlClient.request(getCertificationsQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
        status: statusParam as CertificationStatus,
      }),
  });

  const certificationPage = getCertificationsResponse?.getCertifications;
  return (
    certificationPage && (
      <div className="flex flex-col">
        <PageTitle>Espace pro administrateur</PageTitle>
        <br />
        {getCertificationsQueryStatus === "success" && (
          <SearchList
            title={`Certifications ${
              statusParam
                ? statusParam === "AVAILABLE"
                  ? "disponibles"
                  : "inactives"
                : ""
            }`}
            searchFilter={searchFilter}
            searchResultsPage={certificationPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(c) => (
              <WhiteCard key={c.id} className="gap-2">
                <span className="text-gray-500 text-sm">{c.codeRncp}</span>
                <span className="text-lg font-bold">{c.label}</span>
                <span>{c.certificationAuthorityTag}</span>
                <span>Expire le: {format(c.expiresAt, "dd/MM/yyyy")}</span>
                <Tag
                  small
                  className={`mt-2 text-black ${
                    c.status === "AVAILABLE" ? "bg-green-300" : "bg-red-400"
                  } `}
                >
                  {c.status === "AVAILABLE" ? "Disponible" : "Inactive"}
                </Tag>
                <Button
                  className="mt-2 ml-auto"
                  linkProps={{
                    href: `/certifications/${c.id}`,
                  }}
                >
                  Accéder à la certification
                </Button>
              </WhiteCard>
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default CertificationListPage;
