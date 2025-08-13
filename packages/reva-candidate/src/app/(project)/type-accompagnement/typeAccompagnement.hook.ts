import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { TypeAccompagnement } from "@/graphql/generated/graphql";

const getCandidateQuery = graphql(`
  query getCandidateWithCandidacyForTypeAccompagnementPage {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
        certification {
          isAapAvailable
        }
        id
        typeAccompagnement
      }
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

  const { data: getCandidateResponse, status: queryStatus } = useQuery({
    queryKey: [
      "candidate",
      "getCandidateWithCandidacyForTypeAccompagnementPage",
    ],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const updateTypeAccompagnement = useMutation({
    mutationFn: (data: { typeAccompagnement: TypeAccompagnement }) =>
      graphqlClient.request(updateTypeAccompagnementMutation, {
        ...data,
        candidacyId: candidacy?.id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate"] }),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;
  const typeAccompagnement = candidacy?.typeAccompagnement;
  const isAapAvailable = candidacy?.certification?.isAapAvailable;

  return {
    typeAccompagnement,
    queryStatus,
    updateTypeAccompagnement,
    isAapAvailable,
  };
};
