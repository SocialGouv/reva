import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCandidateContactDetailsQuery = graphql(`
  query getCandidateContactDetails($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        id
        phone
        email
      }
    }
  }
`);

export const useCandidateContactDetailsPageLogic = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateContactDetailsResponse } = useQuery({
    queryKey: ["getCandidateContactDetails", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidateContactDetailsQuery, {
        candidacyId,
      }),
  });

  const candidate =
    getCandidateContactDetailsResponse?.getCandidacyById?.candidate;

  return {
    candidate,
  };
};
