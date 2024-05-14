import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForCandidacyTrainingPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      typology
      conventionCollective {
        id
        idcc
        label
      }
    }
  }
`);

export const useTrainingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForCandidateTrainingPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacy };
};
