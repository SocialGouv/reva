import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

// Supprime les comptes sandbox FranceConnect ciblés (DB + Keycloak).
// Retourne le nombre de suppressions réellement effectuées.
const deleteFranceConnectSandboxCandidatesMutation = graphql(`
  mutation deleteFranceConnectSandboxCandidates($emails: [String!]!) {
    candidate_deleteFranceConnectSandboxCandidates(emails: $emails)
  }
`);

// Liste les comptes sandbox FranceConnect présents en base (tri côté serveur).
const getFranceConnectSandboxCandidatesQuery = graphql(`
  query getFranceConnectSandboxCandidates {
    candidate_getFranceConnectSandboxCandidates {
      id
      email
      firstname
      lastname
    }
  }
`);

const SANDBOX_CANDIDATES_QUERY_KEY = [
  "candidates",
  "fcSandboxCleanup",
] as const;

// Hook central de la page de nettoyage sandbox FranceConnect :
// - récupère la liste des comptes sandbox présents en base
// - expose la mutation de suppression qui invalide le cache après succès
export const useFcSandboxCleanup = ({ enabled }: { enabled: boolean }) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: candidatesResponse,
    status: candidatesStatus,
    isFetching: candidatesIsFetching,
  } = useQuery({
    queryKey: SANDBOX_CANDIDATES_QUERY_KEY,
    queryFn: () =>
      graphqlClient.request(getFranceConnectSandboxCandidatesQuery),
    enabled,
  });

  const deleteSandboxCandidates = useMutation({
    mutationFn: (emails: string[]) =>
      graphqlClient.request(deleteFranceConnectSandboxCandidatesMutation, {
        emails,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SANDBOX_CANDIDATES_QUERY_KEY });
    },
  });

  const candidates =
    candidatesResponse?.candidate_getFranceConnectSandboxCandidates ?? [];

  return {
    candidates,
    candidatesStatus,
    candidatesIsFetching,
    deleteSandboxCandidates,
  };
};
