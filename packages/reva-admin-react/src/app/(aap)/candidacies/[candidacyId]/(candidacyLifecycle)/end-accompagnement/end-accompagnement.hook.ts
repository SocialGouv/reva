import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyEndAccompagnementById = graphql(`
  query getCandidacyEndAccompagnementById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
      }
      endAccompagnementDate
      endAccompagnementStatus
      certification {
        codeRncp
        label
      }
    }
  }
`);

export const useEndAccompagnement = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyData, isLoading: getCandidacyIsLoading } = useQuery(
    {
      queryKey: [candidacyId, "getCandidacyEndAccompagnementById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyEndAccompagnementById, {
          candidacyId,
        }),
    },
  );
  const candidacy = getCandidacyData?.getCandidacyById;
  const candidate = candidacy?.candidate;
  const certification = candidacy?.certification;

  return {
    candidacyId,
    candidacy,
    candidate,
    certification,
    getCandidacyIsLoading,
  };
};
