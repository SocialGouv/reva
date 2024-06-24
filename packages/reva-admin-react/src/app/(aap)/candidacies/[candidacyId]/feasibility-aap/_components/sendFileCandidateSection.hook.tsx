import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileSendFileCandidateCardByCandidacyId = graphql(
  `
    query dematerializedFeasibilityFileSendFileCandidateCardByCandidacyId(
      $candidacyId: ID!
    ) {
      dematerialized_feasibility_file_getByCandidacyId(
        candidacyId: $candidacyId
      ) {
        sentToCandidateAt
      }
    }
  `,
);

export const useSendFileCandidateSection = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileSendFileCandidateCardByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        dematerializedFeasibilityFileSendFileCandidateCardByCandidacyId,
        {
          candidacyId,
        },
      ),
  });
  const isDematerializedFeasibilityFileHasBeenSent =
    data?.dematerialized_feasibility_file_getByCandidacyId?.sentToCandidateAt;

  return {
    isDematerializedFeasibilityFileHasBeenSent,
  };
};
