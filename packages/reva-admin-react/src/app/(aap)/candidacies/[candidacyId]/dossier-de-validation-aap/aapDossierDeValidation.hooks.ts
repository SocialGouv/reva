import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/dist/client/components/navigation";
import { REST_API_URL } from "@/config/config";
import { DossierDeValidationFormData } from "./_components/DossierDeValidationTab";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

const getCandidacyQuery = graphql(`
  query getCandidacyForDossierDeValidationAapPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
      activeDossierDeValidation {
        id
        dossierDeValidationSentAt
        dossierDeValidationFile {
          name
          url
        }
        dossierDeValidationOtherFiles {
          name
          url
        }
      }
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
  const { accessToken } = useKeycloakContext();

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

  const sendDossierDeValidation = async (data: DossierDeValidationFormData) => {
    const formData = new FormData();

    formData.append("candidacyId", candidacyId);

    if (data.dossierDeValidationFile?.[0]) {
      formData.append(
        "dossierDeValidationFile",
        data.dossierDeValidationFile?.[0],
      );
    }

    data.dossierDeValidationOtherFiles.forEach(
      (f) => f?.[0] && formData.append("dossierDeValidationOtherFiles", f?.[0]),
    );

    const result = await fetch(
      `${REST_API_URL}/dossier-de-validation/upload-dossier-de-validation`,
      {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );
    if (!result.ok) {
      const errorMessage = await result.text();
      throw new Error(errorMessage);
    }
  };

  return {
    candidacy,
    getCandidacyStatus,
    setReadyForJuryEstimatedAt,
    sendDossierDeValidation,
  };
};
