import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

const GET_CANDIDACY_WITH_CERTIFICATION = graphql(`
  query candidate_getCandidacyWithCertification {
    candidate_getCandidateWithCandidacy {
      candidacy {
        typeAccompagnement
        id
        candidacyDropOut {
          createdAt
        }
        status
        certification {
          label
          id
          isAapAvailable
        }
        hasMoreThanOneCertificationAvailable
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

export const useCandidacyForCertification = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isRefetching } = useSuspenseQuery({
    queryKey: ["getCandidacyWithCertification"],
    queryFn: () => graphqlClient.request(GET_CANDIDACY_WITH_CERTIFICATION),
  });

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus:
      data?.candidate_getCandidateWithCandidacy?.candidacy.status,
    typeAccompagnement:
      data?.candidate_getCandidateWithCandidacy?.candidacy.typeAccompagnement,
    candidacyDropOut:
      !!data?.candidate_getCandidateWithCandidacy?.candidacy?.candidacyDropOut,
  });

  const updateCertification = useMutation({
    mutationKey: ["candidacy_certification_updateCertification"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["getCandidacyWithCertification"],
      });
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

  return {
    canEditCandidacy,
    isRefetching,
    candidacy: data?.candidate_getCandidateWithCandidacy?.candidacy,
    certification:
      data?.candidate_getCandidateWithCandidacy?.candidacy.certification,
    updateCertification,
  };
};
