import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const createOrUpdateAttachments = graphql(`
  mutation createOrUpdateAttachments(
    $input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateAttachments(
      input: $input
      candidacyId: $candidacyId
    )
  }
`);

const feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId =
  graphql(`
    query feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId(
      $candidacyId: ID!
    ) {
      feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
        dematerializedFeasibilityFile {
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
          feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const feasibility =
    getCandidacyByIdResponse?.feasibility_getActiveFeasibilityByCandidacyId;
  const attachments = feasibility?.dematerializedFeasibilityFile?.attachments;
  return {
    attachments,
    queryStatus: getCandidacyByIdStatus,
  };
};
