import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";

const SEARCH_CERTIFICATIONS_FOR_CANDIDATE = graphql(`
  query searchCertificationsForCandidateDashboard(
    $offset: Int
    $limit: Int
    $searchText: String
    $candidacyId: ID
  ) {
    searchCertificationsForCandidate(
      offset: $offset
      limit: $limit
      searchText: $searchText
      candidacyId: $candidacyId
    ) {
      rows {
        id
        label
        summary
        codeRncp
        status
        certificationAuthorityStructure {
          id
          label
        }
      }
      info {
        totalRows
        currentPage
        totalPages
        pageLength
      }
    }
  }
`);

const UPDATE_CERTIFICATION = graphql(`
  mutation candidacy_certification_updateCertification(
    $candidacyId: ID!
    $certificationId: ID!
  ) {
    candidacy_certification_updateCertification(
      candidacyId: $candidacyId
      certificationId: $certificationId
    )
  }
`);

const GET_CANDIDACY_BY_ID_FOR_SEARCH_CERTIFICATION_PAGE = graphql(`
  query getCandidacyByIdForSearchCertificationPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      typeAccompagnement
      candidacyDropOut {
        createdAt
      }
      certification {
        id
        label
        codeRncp
      }
    }
  }
`);

export const useCandidacyForCertificationSearch = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ["candidacy", "search-certification", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_SEARCH_CERTIFICATION_PAGE, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;
  const candidacyStatus = candidacy?.status;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus,
    typeAccompagnement: candidacy?.typeAccompagnement,
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  return {
    isLoading,
    candidacyId,
    candidacy,
    canEditCandidacy,
  };
};

export const useSetCertification = ({
  searchText,
  currentPage,
  candidacyId,
}: {
  searchText?: string;
  currentPage: number;
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const searchCertificationsForCandidate = useSuspenseQuery({
    queryKey: [
      "searchCertificationsForCandidate",
      searchText,
      currentPage,
      candidacyId,
    ],
    queryFn: () =>
      graphqlClient.request(SEARCH_CERTIFICATIONS_FOR_CANDIDATE, {
        offset,
        limit: RECORDS_PER_PAGE,
        searchText,
        candidacyId,
      }),
    gcTime: 0,
  });

  const updateCertification = useMutation({
    mutationKey: ["candidacy_certification_updateCertification"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidacy"] });
    },
    mutationFn: ({ certificationId }: { certificationId: string }) =>
      graphqlClient.request(UPDATE_CERTIFICATION, {
        candidacyId,
        certificationId,
      }),
  });

  return { searchCertificationsForCandidate, updateCertification };
};
