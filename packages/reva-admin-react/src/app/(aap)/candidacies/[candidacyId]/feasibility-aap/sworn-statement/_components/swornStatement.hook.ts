import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const createOrUpdateSwornStatement = graphql(`
  mutation createOrUpdateSwornStatement(
    $input: DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateSwornStatement(
      input: $input
    ) {
      id
    }
  }
`);

const dematerializedFeasibilityFileWithSwornStatementByCandidacyId = graphql(`
  query dematerializedFeasibilityFileWithSwornStatementByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      swornStatementFile {
        name
        previewUrl
        url
        mimeType
        __typename
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
          dematerializedFeasibilityFileWithSwornStatementByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const candidacy =
    getCandidacyByIdResponse?.dematerialized_feasibility_file_getByCandidacyId;
  const swornStatementFile = candidacy?.swornStatementFile;
  return {
    swornStatementFile,
    queryStatus: getCandidacyByIdStatus,
  };
};
