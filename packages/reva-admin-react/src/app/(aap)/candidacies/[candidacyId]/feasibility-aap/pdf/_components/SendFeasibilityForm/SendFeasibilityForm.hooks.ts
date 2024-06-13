import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { REST_API_URL } from "@/config/config";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

const getCandidacyQuery = graphql(`
  query getCandidacyForFeasibility($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
      }
      certification {
        id
        label
        codeRncp
        typeDiplome {
          label
        }
      }
      certificationAuthorities {
        id
        label
        contactFullName
        contactEmail
      }
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

export type FeasibilityInputType = {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: File;
  IDFile: File;
  documentaryProofFile?: File;
  certificateOfAttendanceFile?: File;
};

export const useHooks = (candidacyId: string) => {
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
        queryKey: [candidacyId, "getCandidacyForFeasibility"],
      });
    },
  });

  return { candidacy, sendFeasibility };
};
