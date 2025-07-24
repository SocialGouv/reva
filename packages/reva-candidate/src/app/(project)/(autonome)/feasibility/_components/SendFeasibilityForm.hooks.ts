import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { REST_API_URL } from "@/config/config";

type FeasibilityInputType = {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: File;
  IDFile: File;
  documentaryProofFile?: File;
  certificateOfAttendanceFile?: File;
};

export const useSendFeasibilityForm = (candidacyId: string) => {
  const { accessToken } = useKeycloakContext();
  const queryClient = useQueryClient();

  const sendFeasibility = useMutation({
    mutationKey: ["candidateUploadfeasibility", candidacyId],
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
        queryKey: ["candidate"],
      });
    },
  });

  return { sendFeasibility };
};
