import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyWithDossierDeValidationQuery = graphql(`
  query getCandidacyWithDossierDeValidation($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
      candidacyStatuses {
        status
        isActive
      }
      activeDossierDeValidation {
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
  const readyForJuryEstimatedAt = candidacy?.readyForJuryEstimatedAt;

  const canSignalProblem =
    candidacy?.candidacyStatuses.filter((c) => c.isActive)[0].status ===
      "DOSSIER_DE_VALIDATION_ENVOYE" &&
    dossierDeValidation?.decision === "PENDING" &&
    dossierDeValidation?.isActive;

  return {
    getDossierDeValidationStatus,
    dossierDeValidation,
    candidacy,
    readyForJuryEstimatedAt,
    canSignalProblem,
  };
};
