import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const sendToCandidate = graphql(`
  mutation sendToCandidate($dematerializedFeasibilityFileId: ID!) {
    dematerialized_feasibility_file_sendToCandidate(
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
    )
  }
`);

const dematerializedFeasibilityFileSendFileCandidateByCandidacyId = graphql(`
  query dematerializedFeasibilityFileSendFileCandidateByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

export const useSendFileCandidate = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse, status: getCandidacyByIdStatus } =
    useQuery({
      queryKey: [
        candidacyId,
        "dematerializedFeasibilityFileSendFileCandidateByCandidacyId",
      ],
      queryFn: () =>
        graphqlClient.request(
          dematerializedFeasibilityFileSendFileCandidateByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const { mutateAsync: sendToCandidateMutation } = useMutation({
    mutationFn: (dematerializedFeasibilityFileId: string) =>
      graphqlClient.request(sendToCandidate, {
        dematerializedFeasibilityFileId,
      }),
  });

  const dematerializedFeasibilityFile =
    getCandidacyByIdResponse?.dematerialized_feasibility_file_getByCandidacyId;
  const dematerializedFeasibilityFileId = dematerializedFeasibilityFile?.id;
  return {
    dematerializedFeasibilityFileId,
    sendToCandidateMutation,
  };
};
