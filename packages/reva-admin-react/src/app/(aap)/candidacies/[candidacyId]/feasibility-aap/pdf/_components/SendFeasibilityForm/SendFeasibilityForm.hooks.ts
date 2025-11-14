import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { REST_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

const getCandidacyQuery = graphql(`
  query getCandidacySendFeasibilityForm($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
        department {
          id
          label
        }
      }
      organism {
        contactAdministrativePhone
        contactAdministrativeEmail
        adresseVille
        adresseCodePostal
        adresseInformationsComplementaires
        adresseNumeroEtNomDeRue
        emailContact
        telephone
        nomPublic
        label
      }
      certification {
        id
        label
        codeRncp
        typeDiplome
      }
      certificationAuthorities {
        certificationAuthorityLocalAccounts {
          contactFullName
          contactEmail
          contactPhone
        }
        id
        label
        contactFullName
        contactEmail
      }
      warningOnFeasibilitySubmission
      feasibility {
        id
        decision
        decisionSentAt
        decisionComment
        certificationAuthority {
          id
          label
          contactFullName
          contactEmail
        }
        feasibilityUploadedPdf {
          feasibilityFile {
            name
            url
          }
          IDFile {
            name
            url
          }
          documentaryProofFile {
            name
            url
          }
          certificateOfAttendanceFile {
            name
            url
          }
        }
        history {
          id
          decision
          decisionSentAt
          decisionComment
        }
      }
    }
  }
`);

type FeasibilityInputType = {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: File;
  IDFile: File;
  documentaryProofFile?: File;
  certificateOfAttendanceFile?: File;
};

export const useSendFeasibilityForm = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();
  const { accessToken } = useKeycloakContext();
  const queryClient = useQueryClient();

  const candidacy = useQuery({
    queryKey: [candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const sendFeasibility = useMutation({
    mutationKey: ["scheduleJuryByCandidacyId", candidacyId],
    mutationFn: (data: FeasibilityInputType) => {
      const formData = new FormData();
      formData.append("candidacyId", data.candidacyId);
      formData.append(
        "certificationAuthorityId",
        data.certificationAuthorityId,
      );

      formData.append("feasibilityFile", data.feasibilityFile);
      formData.append("IDFile", data.IDFile);

      if (data.documentaryProofFile) {
        formData.append("documentaryProofFile", data.documentaryProofFile);
      }
      if (data.certificateOfAttendanceFile) {
        formData.append(
          "certificateOfAttendanceFile",
          data.certificateOfAttendanceFile,
        );
      }

      return fetch(`${REST_API_URL}/feasibility/upload-feasibility-file`, {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId, "getCandidacySendFeasibilityForm"],
      });
    },
  });

  return { candidacy, sendFeasibility };
};
