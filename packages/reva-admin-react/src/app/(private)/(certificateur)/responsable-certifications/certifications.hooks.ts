import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CertificationStatus } from "@/graphql/generated/graphql";

const getCertificationsQuery = graphql(`
  query getCertificationsV2ForRegistryManager(
    $offset: Int
    $searchFilter: String
    $status: CertificationStatus
    $visible: Boolean
  ) {
    searchCertificationsV2ForRegistryManager(
      limit: 10
      offset: $offset
      searchText: $searchFilter
      status: $status
      visible: $visible
    ) {
      rows {
        id
        label
        codeRncp
        status
        visible
        certificationAuthorityStructure {
          label
        }
        rncpExpiresAt
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
export const useCertifications = ({
  searchFilter,
  currentPage = 1,
  status,
  visible,
}: {
  searchFilter?: string;
  currentPage?: number;
  status?: CertificationStatus;
  visible?: boolean;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationsResponse,
    status: getCertificationsQueryStatus,
  } = useQuery({
    queryKey: [
      "getCertificationsForRegistryManager",
      searchFilter,
      currentPage,
      status,
      visible,
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationsQuery, {
        status: status as CertificationStatus,
        visible,
        searchFilter,
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
      }),
  });

  const certificationPage =
    getCertificationsResponse?.searchCertificationsV2ForRegistryManager;

  return {
    certificationPage,
    getCertificationsQueryStatus,
  };
};
