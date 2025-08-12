import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_CERTIFICATION = graphql(`
  query getCandidateWithCandidacyForCertification {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
        status
        typeAccompagnement
        candidacyDropOut {
          createdAt
        }
      }
    }
  }
`);

const SEARCH_CERTIFICATIONS_FOR_CANDIDATE = graphql(`
  query searchCertificationsForCandidate(
    $offset: Int
    $limit: Int
    $searchText: String
  ) {
    searchCertificationsForCandidate(
      offset: $offset
      limit: $limit
      searchText: $searchText
    ) {
      rows {
        id
        label
        summary
        codeRncp
        status
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

export const useSetCertification = ({
  searchText,
  currentPage,
}: {
  searchText?: string;
  currentPage: number;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const {
    data: searchCertificationsForCandidate,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["searchCertificationsForCandidate", searchText, currentPage],
    queryFn: () =>
      graphqlClient.request(SEARCH_CERTIFICATIONS_FOR_CANDIDATE, {
        offset,
        limit: RECORDS_PER_PAGE,
        searchText,
      }),
    gcTime: 0,
  });

  const { data: candidateWithCandidacyForCertification } = useQuery({
    queryKey: ["candidate", "candidateWithCandidacyForCertification"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_FOR_CERTIFICATION),
  });

  const candidate =
    candidateWithCandidacyForCertification?.candidate_getCandidateWithCandidacy;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidate?.candidacy?.status,
    typeAccompagnement: candidate?.candidacy?.typeAccompagnement,
    candidacyDropOut: !!candidate?.candidacy?.candidacyDropOut,
  });

  const updateCertification = useMutation({
    mutationKey: ["candidacy_certification_updateCertification"],
    mutationFn: ({
      candidacyId,
      certificationId,
    }: {
      candidacyId: string;
      certificationId: string;
    }) =>
      graphqlClient.request(UPDATE_CERTIFICATION, {
        candidacyId,
        certificationId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate"],
      });
    },
  });

  return {
    searchCertificationsForCandidate,
    updateCertification,
    candidate,
    canEditCandidacy,
    isLoading,
    isFetching,
  };
};
