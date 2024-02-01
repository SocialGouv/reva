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
      isActive
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
        candidacyStatuses {
          status
          isActive
        }
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

  const {
    data: getDossierDeValidationResponse,
    status: getDossierDeValidationStatus,
  } = useQuery({
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

  const canSignalProblem =
    dossierDeValidation?.candidacy.candidacyStatuses.filter(
      (c) => c.isActive,
    )[0].status === "DOSSIER_DE_VALIDATION_ENVOYE" &&
    dossierDeValidation.decision === "PENDING" &&
    dossierDeValidation.isActive;

  return {
    getDossierDeValidationStatus,
    dossierDeValidation,
    estimatedExamDate,
    canSignalProblem,
  };
};
