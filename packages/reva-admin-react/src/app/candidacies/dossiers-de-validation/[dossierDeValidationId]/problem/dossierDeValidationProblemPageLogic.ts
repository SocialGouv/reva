import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getDossierDeValidationQuery = graphql(`
  query getDossierDeValidationForProblemPage($dossierDeValidationId: ID!) {
    dossierDeValidation_getDossierDeValidationById(
      dossierDeValidationId: $dossierDeValidationId
    ) {
      id
      dossierDeValidationSentAt
    }
  }
`);

const signalDossierDeValidationProblemMutation = graphql(`
  mutation dossierDeValidation_signalProblem(
    $dossierDeValidationId: ID!
    $decisionComment: String!
  ) {
    dossierDeValidation_signalProblem(
      dossierDeValidationId: $dossierDeValidationId
      decisionComment: $decisionComment
    ) {
      id
    }
  }
`);

export const useDossierDeValidationProblemPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { dossierDeValidationId } = useParams<{
    dossierDeValidationId: string;
  }>();

  const { data: getDossierDeValidationResponse } = useQuery({
    queryKey: ["getDossierDeValidationForProblemPage", dossierDeValidationId],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationQuery, {
        dossierDeValidationId,
      }),
  });

  const signalDossierDeValidationProblem = useMutation({
    mutationFn: ({
      dossierDeValidationId,
      decisionComment,
    }: {
      dossierDeValidationId: string;
      decisionComment: string;
    }) =>
      graphqlClient.request(signalDossierDeValidationProblemMutation, {
        dossierDeValidationId,
        decisionComment,
      }),
  });

  const dossierDeValidation =
    getDossierDeValidationResponse?.dossierDeValidation_getDossierDeValidationById;

  return {
    dossierDeValidation,
    signalDossierDeValidationProblem,
  };
};
