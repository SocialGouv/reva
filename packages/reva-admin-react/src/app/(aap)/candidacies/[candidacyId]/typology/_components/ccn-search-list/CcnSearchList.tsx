import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;
const getCcnsQuery = graphql(`
  query getCCNsForCCNSearchList(
    $offset: Int
    $limit: Int
    $searchFilter: String
  ) {
    candidacy_getCandidacyCcns(
      offset: $offset
      limit: $limit
      searchFilter: $searchFilter
    ) {
      rows {
        id
        idcc
        label
      }
      info {
        totalRows
        currentPage
        totalPages
      }
    }
  }
`);

export const CcnSearchList = ({
  onCcnButtonClick,
}: {
  onCcnButtonClick?(id: string): void;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const { data: getCCnsResponse, status: getCCnsQueryStatus } = useQuery({
    queryKey: ["getCcns", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getCcnsQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  return (
    getCCnsQueryStatus === "success" && (
      <SearchList
        searchFilter={searchFilter}
        searchResultsPage={getCCnsResponse.candidacy_getCandidacyCcns}
      >
        {(ccn) => (
          <li key={ccn.id} className="flex flex-col border-b pb-4">
            <span className="text-gray-500">{ccn.idcc}</span>
            <span className="font-bold">{ccn.label}</span>
            <Button
              type="button"
              priority="tertiary"
              className="ml-auto"
              onClick={() => onCcnButtonClick?.(ccn.id)}
            >
              Choisir
            </Button>
          </li>
        )}
      </SearchList>
    )
  );
};
