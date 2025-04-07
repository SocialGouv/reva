import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

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
        isAapAvailable
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

const GET_CANDIDACY_CERTIFICATION = graphql(`
  query candidate_getCertificationForSearchPage {
    candidate_getCandidateWithCandidacy {
      candidacy {
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
          isAapAvailable
        }
      }
    }
  }
`);

export const useCandidacyForCertificationSearch = () => {
  const { graphqlClient } = useGraphQlClient();

  const candidateWithCandidacy = useSuspenseQuery({
    queryKey: ["candidacyForCertificationsPage"],
    queryFn: () => graphqlClient.request(GET_CANDIDACY_CERTIFICATION),
  });

  const candidacy =
    candidateWithCandidacy?.data?.candidate_getCandidateWithCandidacy
      ?.candidacy;
  const candidacyStatus = candidacy?.status;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus,
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  return {
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
  const { invalidateQueries } = useQueryClient();

  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const searchCertificationsForCandidate = useSuspenseQuery({
    queryKey: ["searchCertificationsForCandidate", searchText, currentPage],
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
      try {
        invalidateQueries({ queryKey: ["dashboard"] });
      } catch (e) {
        console.error(e);
      }
    },
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
  });

  return { searchCertificationsForCandidate, updateCertification };
};
