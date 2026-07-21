import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PREVIEW_URL_REFETCH_INTERVAL_MS } from "@/constants/previewUrl.constant";

import { graphql } from "@/graphql/generated";

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
        candidacy {
          candidate {
            givenName
            lastname
            firstname
          }
        }
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
      refetchInterval: PREVIEW_URL_REFETCH_INTERVAL_MS,
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
  const candidate = feasibility?.candidacy?.candidate;

  return {
    attachments,
    candidate,
    queryStatus: getCandidacyByIdStatus,
  };
};
