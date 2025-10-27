import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { TypeAccompagnement } from "@/graphql/generated/graphql";

const getCandidacyByIdForTypeAccompagnementPage = graphql(`
  query getCandidacyByIdForTypeAccompagnementPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        isAapAvailable
      }
      typeAccompagnement
    }
  }
`);

const updateTypeAccompagnementMutation = graphql(`
  mutation updateTypeAccompagnementForTypeAccompagnementPage(
    $candidacyId: UUID!
    $typeAccompagnement: TypeAccompagnement!
  ) {
    candidacy_updateTypeAccompagnement(
      candidacyId: $candidacyId
      typeAccompagnement: $typeAccompagnement
    ) {
      id
      typeAccompagnement
    }
  }
`);

export const useTypeAccompagnementPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidateResponse, status: queryStatus } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForTypeAccompagnementPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForTypeAccompagnementPage, {
        candidacyId,
      }),
  });

  const updateTypeAccompagnement = useMutation({
    mutationFn: (data: { typeAccompagnement: TypeAccompagnement }) =>
      graphqlClient.request(updateTypeAccompagnementMutation, {
        ...data,
        candidacyId: candidacy?.id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidacy"] }),
  });

  const candidacy = getCandidateResponse?.getCandidacyById;
  const typeAccompagnement = candidacy?.typeAccompagnement;
  const isAapAvailable = candidacy?.certification?.isAapAvailable;

  return {
    typeAccompagnement,
    queryStatus,
    updateTypeAccompagnement,
    isAapAvailable,
  };
};
