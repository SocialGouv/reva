import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_HEADER = graphql(`
  query getCandidacyByIdWithCandidateForHeader($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activite
      derniereDateActivite
      typeAccompagnement
      endAccompagnementStatus
    }
  }
`);

export const useHeader = () => {
  const { graphqlClient } = useGraphQlClient();
  const { authenticated } = useKeycloakContext();
  const { candidacyId } = useParams<{
    candidacyId?: string;
  }>();

  const { data, isLoading } = useQuery({
    queryKey: ["candidacy", "header"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_HEADER, {
        candidacyId: candidacyId!,
      }),
    enabled: !!candidacyId && authenticated,
  });

  const candidacy = data?.getCandidacyById;

  return {
    isLoading,
    candidacyId,
    candidacy,
  };
};
