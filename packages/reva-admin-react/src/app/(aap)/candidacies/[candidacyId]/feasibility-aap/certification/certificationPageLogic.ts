import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAapFeasibilityCertificationPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      certification {
        label
        codeRncp
        competenceBlocs {
          id
          code
          label
        }
      }
    }
  }
`);

export const useCertificationPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyByIdForAapFeasibilityCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  return { certification };
};
