import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/dist/client/components/navigation";

const getCandidacyQuery = graphql(`
  query getCandidacyForDossierDeValidationAapPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
    }
  }
`);

const setReadyForJuryEstimatedAtMutation = graphql(`
  mutation setReadyForJuryEstimatedAtForDossierDeValidationAapPage(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Timestamp!
  ) {
    candidacy_setReadyForJuryEstimatedAt(
      candidacyId: $candidacyId
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
    }
  }
`);
export const useAapDossierDeValidationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId, "getCandidacyForDossierDeValidation"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const setReadyForJuryEstimatedAt = useMutation({
    mutationFn: ({
      readyForJuryEstimatedAt,
    }: {
      readyForJuryEstimatedAt: number;
    }) =>
      graphqlClient.request(setReadyForJuryEstimatedAtMutation, {
        candidacyId,
        readyForJuryEstimatedAt,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return { candidacy, getCandidacyStatus, setReadyForJuryEstimatedAt };
};
