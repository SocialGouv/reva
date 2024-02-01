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
      decision
      dossierDeValidationSentAt
      dossierDeValidationFile {
        url
        name
      }
      dossierDeValidationOtherFiles {
        url
        name
      }
      candidacy {
        examInfo {
          estimatedExamDate
        }
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

  const estimatedExamDate =
    getDossierDeValidationResponse
      ?.dossierDeValidation_getDossierDeValidationById?.candidacy?.examInfo
      .estimatedExamDate;

  return {
    dossierDeValidation,
    estimatedExamDate,
  };
};
