import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const createOrUpdateAttachments = graphql(`
  mutation createOrUpdateAttachments(
    $input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateAttachments(input: $input)
  }
`);

const dematerializedFeasibilityFileWithAttachmentsByCandidacyId = graphql(`
  query dematerializedFeasibilityFileWithAttachmentsByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      attachments {
        type
        file {
          name
          previewUrl
          url
          mimeType
          __typename
        }
      }
    }
  }
`);

export const useAttachments = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse, status: getCandidacyByIdStatus } =
    useQuery({
      queryKey: [
        candidacyId,
        "dematerializedFeasibilityFileWithAttachmentsByCandidacyId",
      ],
      queryFn: () =>
        graphqlClient.request(
          dematerializedFeasibilityFileWithAttachmentsByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const candidacy =
    getCandidacyByIdResponse?.dematerialized_feasibility_file_getByCandidacyId;
  const attachments = candidacy?.attachments;
  return {
    attachments,
    queryStatus: getCandidacyByIdStatus,
  };
};
