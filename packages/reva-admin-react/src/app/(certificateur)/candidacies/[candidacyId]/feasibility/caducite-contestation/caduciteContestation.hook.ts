import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CertificationAuthorityContestationDecision } from "@/graphql/generated/graphql";

const getCandidacyCaduciteContestationQuery = graphql(`
  query getCandidacyCaduciteContestationQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        firstname
        lastname
      }
      feasibility {
        decisionSentAt
      }
      isCaduque
      lastActivityDate
      readyForJuryEstimatedAt
      candidacyContestationsCaducite {
        contestationSentAt
        certificationAuthorityContestationDecision
        contestationReason
      }
    }
  }
`);

const updateContestationCaduciteDecisionQuery = graphql(`
  mutation updateContestationCaduciteDecisionQuery(
    $candidacyId: ID!
    $certificationAuthorityContestationDecision: CertificationAuthorityContestationDecision!
  ) {
    candidacy_contestation_caducite_update_certification_authority_contestation_decision(
      candidacyId: $candidacyId
      certificationAuthorityContestationDecision: $certificationAuthorityContestationDecision
    ) {
      id
    }
  }
`);

export const useCaduciteContestation = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const queryClient = useQueryClient();

  const { data: getCaduciteContestationResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyCaduciteContestationQuery"],
    queryFn: () =>
      graphqlClient.request(getCandidacyCaduciteContestationQuery, {
        candidacyId,
      }),
  });

  const candidacy = getCaduciteContestationResponse?.getCandidacyById;

  const { mutateAsync: updateContestationCaduciteDecision } = useMutation({
    mutationFn: (
      certificationAuthorityContestationDecision: CertificationAuthorityContestationDecision,
    ) =>
      graphqlClient.request(updateContestationCaduciteDecisionQuery, {
        candidacyId,
        certificationAuthorityContestationDecision,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
  });

  return {
    candidacy,
    updateContestationCaduciteDecision,
  };
};
