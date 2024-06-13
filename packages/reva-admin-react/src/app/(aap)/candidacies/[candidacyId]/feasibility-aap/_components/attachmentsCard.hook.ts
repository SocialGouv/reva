import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileAttachmentsByCandidacyId = graphql(`
  query dematerializedFeasibilityFileAttachmentsByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      attachmentsPartComplete
    }
  }
`);

export const useAttachmentsCard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isLoadingAttachments } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileAttachmentsByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        dematerializedFeasibilityFileAttachmentsByCandidacyId,
        {
          candidacyId,
        },
      ),
  });
  const attachmentsPartComplete =
    data?.dematerialized_feasibility_file_getByCandidacyId
      ?.attachmentsPartComplete;

  return {
    attachmentsPartComplete,
    isLoadingAttachments,
  };
};
