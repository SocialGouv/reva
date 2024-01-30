import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getDossierDeValidationQuery = graphql(`
  query getDossierDeValidation($dossierDeValidationId: ID!) {
    dossierDeValidation_getDossierDeValidationById(
      dossierDeValidationId: $dossierDeValidationId
    ) {
      id
      dossierDeValidationSentAt
      dossierDeValidationFile {
        url
        name
      }
      dossierDeValidationOtherFiles {
        url
        name
      }
    }
  }
`);

export const useDossierDeValidationPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { dossierDeValidationId } = useParams<{
    dossierDeValidationId: string;
  }>();

  const { data: getDossierDeValidationResponse } = useQuery({
    queryKey: ["getDossierDeValidation", dossierDeValidationId],
    queryFn: () =>
      graphqlClient.request(getDossierDeValidationQuery, {
        dossierDeValidationId,
      }),
  });

  const dossierDeValidation =
    getDossierDeValidationResponse?.dossierDeValidation_getDossierDeValidationById;

  return {
    dossierDeValidation,
  };
};
