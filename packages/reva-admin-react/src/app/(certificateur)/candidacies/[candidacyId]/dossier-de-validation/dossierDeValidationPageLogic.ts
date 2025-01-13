import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyWithDossierDeValidationQuery = graphql(`
  query getCandidacyWithDossierDeValidation($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
      status
      activeDossierDeValidation {
        id
        decision
        decisionSentAt
        decisionComment
        dossierDeValidationSentAt
        dossierDeValidationFile {
          name
          url
          previewUrl
        }
        dossierDeValidationOtherFiles {
          name
          url
          previewUrl
        }
      }
      historyDossierDeValidation {
        id
        decision
        decisionSentAt
        decisionComment
        dossierDeValidationSentAt
        dossierDeValidationFile {
          name
          url
          previewUrl
        }
        dossierDeValidationOtherFiles {
          name
          url
          previewUrl
        }
      }
    }
  }
`);

export const useDossierDeValidationPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    data: getDossierDeValidationResponse,
    status: getDossierDeValidationStatus,
  } = useQuery({
    queryKey: ["getCandidacyWithDossierDeValidation", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyWithDossierDeValidationQuery, {
        candidacyId,
      }),
  });

  const candidacy = getDossierDeValidationResponse?.getCandidacyById;
  const dossierDeValidation = candidacy?.activeDossierDeValidation;
  const historyDossierDeValidation =
    candidacy?.historyDossierDeValidation || [];

  const readyForJuryEstimatedAt = candidacy?.readyForJuryEstimatedAt;

  const canSignalProblem =
    candidacy?.status === "DOSSIER_DE_VALIDATION_ENVOYE" &&
    dossierDeValidation?.decision === "PENDING";

  return {
    getDossierDeValidationStatus,
    dossierDeValidation,
    historyDossierDeValidation,
    candidacy,
    readyForJuryEstimatedAt,
    canSignalProblem,
  };
};
