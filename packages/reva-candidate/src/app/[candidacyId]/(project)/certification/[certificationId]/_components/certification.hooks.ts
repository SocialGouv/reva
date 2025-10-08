import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CERTIFICATION = graphql(`
  query candidate_getCandidacyByIdWithCertification($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      typeAccompagnement
      candidacyDropOut {
        createdAt
      }
      certification {
        label
        id
        isAapAvailable
      }
      hasMoreThanOneCertificationAvailable
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isRefetching } = useSuspenseQuery({
    queryKey: ["candidacy", "getCandidacyByIdWithCertification"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_CERTIFICATION, {
        candidacyId,
      }),
  });

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: data?.getCandidacyById?.status,
    typeAccompagnement: data?.getCandidacyById?.typeAccompagnement,
    candidacyDropOut: !!data?.getCandidacyById?.candidacyDropOut,
  });

  const updateCertification = useMutation({
    mutationKey: ["candidacy_certification_updateCertification"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidacy"] });
      queryClient.invalidateQueries({
        queryKey: ["getCandidacyByIdWithCertification"],
      });
    },
    mutationFn: ({ certificationId }: { certificationId: string }) =>
      graphqlClient.request(UPDATE_CERTIFICATION, {
        candidacyId,
        certificationId,
      }),
  });

  return {
    canEditCandidacy,
    isRefetching,
    candidacy: data?.getCandidacyById,
    certification: data?.getCandidacyById?.certification,
    updateCertification,
  };
};
