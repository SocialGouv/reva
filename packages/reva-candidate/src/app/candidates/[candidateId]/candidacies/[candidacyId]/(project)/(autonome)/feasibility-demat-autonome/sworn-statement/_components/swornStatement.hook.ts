import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

export const createOrUpdateSwornStatement = graphql(`
  mutation createOrUpdateSwornStatement(
    $input: DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateSwornStatement(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

const feasibilityWithDematerializedFeasibilityFileWithSwornStatementByCandidacyId =
  graphql(`
    query feasibilityWithDematerializedFeasibilityFileWithSwornStatementByCandidacyId(
      $candidacyId: ID!
    ) {
      feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
        dematerializedFeasibilityFile {
          swornStatementFile {
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

export const useSwornStatement = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse, status: getCandidacyByIdStatus } =
    useQuery({
      queryKey: [
        candidacyId,
        "dematerializedFeasibilityFileWithSwornStatementByCandidacyId",
      ],
      queryFn: () =>
        graphqlClient.request(
          feasibilityWithDematerializedFeasibilityFileWithSwornStatementByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const candidacy =
    getCandidacyByIdResponse?.feasibility_getActiveFeasibilityByCandidacyId;
  const swornStatementFile =
    candidacy?.dematerializedFeasibilityFile?.swornStatementFile;
  return {
    swornStatementFile,
    queryStatus: getCandidacyByIdStatus,
  };
};
