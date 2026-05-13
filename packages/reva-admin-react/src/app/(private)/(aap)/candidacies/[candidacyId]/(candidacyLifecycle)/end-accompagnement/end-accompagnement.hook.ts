import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { EndAccompagnementReason } from "@/graphql/generated/graphql";

const getCandidacyEndAccompagnementById = graphql(`
  query getCandidacyEndAccompagnementById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
      }
      endAccompagnementDate
      endAccompagnementStatus
      endAccompagnementReason
      endAccompagnementCandidateDropOutReason {
        label
      }
      certification {
        codeRncp
        label
      }
      feasibility {
        decision
        feasibilityFileSentAt
      }
    }
  }
`);

const getDropoutReasons = graphql(`
  query getDropOutReasons {
    getDropOutReasons {
      id
      label
      isActive
    }
  }
`);

const submitEndAccompagnementMutation = graphql(`
  mutation submitEndAccompagnement(
    $candidacyId: UUID!
    $endAccompagnementDate: Timestamp!
    $endAccompagnementReason: EndAccompagnementReason!
    $endAccompagnementCandidateDropOutReasonId: UUID
  ) {
    candidacy_submitEndAccompagnement(
      candidacyId: $candidacyId
      endAccompagnementDate: $endAccompagnementDate
      endAccompagnementReason: $endAccompagnementReason
      endAccompagnementCandidateDropOutReasonId: $endAccompagnementCandidateDropOutReasonId
    ) {
      id
    }
  }
`);
export const useEndAccompagnement = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyData, isLoading: getCandidacyIsLoading } = useQuery(
    {
      queryKey: [candidacyId, "getCandidacyEndAccompagnementById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyEndAccompagnementById, {
          candidacyId,
        }),
    },
  );
  const candidacy = getCandidacyData?.getCandidacyById;
  const candidate = candidacy?.candidate;
  const certification = candidacy?.certification;
  const feasibility = candidacy?.feasibility;

  const { data: getDropoutReasonsData } = useQuery({
    queryKey: ["getDropoutReasons"],
    queryFn: () => graphqlClient.request(getDropoutReasons),
  });
  const activeDropoutReasons =
    getDropoutReasonsData?.getDropOutReasons.filter(
      (reason) => reason.isActive,
    ) || [];

  const { mutateAsync: submitEndAccompagnement } = useMutation({
    mutationFn: (data: {
      endAccompagnementDate: number;
      endAccompagnementReason: EndAccompagnementReason;
      endAccompagnementCandidateDropOutReasonId?: string;
    }) =>
      graphqlClient.request(submitEndAccompagnementMutation, {
        candidacyId,
        ...data,
      }),
  });

  return {
    candidacyId,
    candidacy,
    candidate,
    certification,
    feasibility,
    getCandidacyIsLoading,
    activeDropoutReasons,
    submitEndAccompagnement,
  };
};
