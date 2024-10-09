import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REST_API_URL } from "@/config/config";
import { useCallback } from "react";
import { useKeycloakContext } from "@/components/auth/keycloak.context";

const getCandidateQuery = graphql(`
  query getCandidateWithCandidacyForDossierDeValidationAutonomePage {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
        id
        readyForJuryEstimatedAt
        feasibility {
          certificationAuthority {
            contactFullName
            contactEmail
          }
        }
        activeDossierDeValidation {
          id
          decision
          decisionSentAt
          decisionComment
          dossierDeValidationSentAt
          dossierDeValidationFile {
            name
            previewUrl
          }
          dossierDeValidationOtherFiles {
            name
            previewUrl
          }
          history {
            id
            decisionSentAt
            decisionComment
          }
        }
      }
    }
  }
`);

const updateReadyForJuryEstimatedAtMutation = graphql(`
  mutation updateReadyForJuryEstimatedAtForDossierDeValidationAutonomePage(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Timestamp!
  ) {
    candidacy_setReadyForJuryEstimatedAt(
      candidacyId: $candidacyId
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
      readyForJuryEstimatedAt
    }
  }
`);

export const useDossierDeValidationAutonomePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { accessToken } = useKeycloakContext();

  const { data: getCandidateResponse, status: queryStatus } = useQuery({
    queryKey: [
      "candidate",
      "getCandidateWithCandidacyForDossierDeValidationAutonomePage",
    ],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const updateReadyForJuryEstimatedAt = useMutation({
    mutationFn: (data: { readyForJuryEstimatedAt: Date }) =>
      graphqlClient.request(updateReadyForJuryEstimatedAtMutation, {
        readyForJuryEstimatedAt: data.readyForJuryEstimatedAt.getTime(),
        candidacyId: candidacy?.id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate"] }),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;
  const readyForJuryEstimatedAt = candidacy?.readyForJuryEstimatedAt;

  const certificationAuthority = candidacy?.feasibility?.certificationAuthority;

  const dossierDeValidation = candidacy?.activeDossierDeValidation;

  const dossierDeValidationProblems =
    dossierDeValidation?.history?.map((h) => ({
      decisionSentAt: new Date(h.decisionSentAt || 0),
      decisionComment: h.decisionComment || "",
    })) || [];

  if (dossierDeValidation?.decision === "INCOMPLETE") {
    dossierDeValidationProblems.unshift({
      decisionSentAt: new Date(dossierDeValidation.decisionSentAt || 0),
      decisionComment: dossierDeValidation.decisionComment || "",
    });
  }

  const sendDossierDeValidation = useCallback(
    async (data: {
      dossierDeValidationFile: {
        0: File;
      };
      dossierDeValidationOtherFiles: {
        0?: File | undefined;
      }[];
    }) => {
      const formData = new FormData();

      formData.append("candidacyId", candidacy?.id || "");

      if (data.dossierDeValidationFile?.[0]) {
        formData.append(
          "dossierDeValidationFile",
          data.dossierDeValidationFile?.[0],
        );
      }

      data.dossierDeValidationOtherFiles.forEach(
        (f) =>
          f?.[0] && formData.append("dossierDeValidationOtherFiles", f?.[0]),
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
    },
    [accessToken, candidacy?.id],
  );

  return {
    readyForJuryEstimatedAt,
    certificationAuthority,
    dossierDeValidation,
    dossierDeValidationProblems,
    queryStatus,
    updateReadyForJuryEstimatedAt,
    sendDossierDeValidation,
  };
};
