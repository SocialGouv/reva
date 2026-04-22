import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/dist/client/components/navigation";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { REST_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

import { DossierDeValidationFormData } from "./_components/DossierDeValidationTab";

const getCandidacyQuery = graphql(`
  query getCandidacyForDossierDeValidationAapPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
      jury {
        result
      }
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

const setReadyForJuryEstimatedAtMutation = graphql(`
  mutation setReadyForJuryEstimatedAtForDossierDeValidationAapPage(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Date!
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
      readyForJuryEstimatedAt: string;
    }) =>
      graphqlClient.request(setReadyForJuryEstimatedAtMutation, {
        candidacyId,
        readyForJuryEstimatedAt,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  const dossierDeValidation = candidacy?.activeDossierDeValidation;

  const historyDossierDeValidation =
    candidacy?.historyDossierDeValidation || [];

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
      if (result.status === 413) {
        throw new Error(
          "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille égale ou inférieure à 10 Mo",
        );
      }
      const errorMessage = await result.text();
      throw new Error(errorMessage);
    }
  };

  return {
    candidacy,
    dossierDeValidation,
    historyDossierDeValidation,
    getCandidacyStatus,
    setReadyForJuryEstimatedAt,
    sendDossierDeValidation,
  };
};
