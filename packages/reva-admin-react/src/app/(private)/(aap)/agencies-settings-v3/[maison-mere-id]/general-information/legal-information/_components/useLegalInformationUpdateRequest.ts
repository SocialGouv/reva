import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUpdateMaisonMereAAPLegalValidationDecision } from "@/app/(private)/(admin)/maisonMereAAPs/[maisonMereAAPId]/(components)/useUpdateMaisonMereAAPLegalValidationDecision";

const TOTAL_UPDATE_REQUEST_COMMENT =
  "France VAE vous demande de mettre à jour l'ensemble de vos informations générales et de vos pièces justificatives.";

export const useLegalInformationUpdateRequest = (maisonMereAAPId: string) => {
  const queryClient = useQueryClient();
  const { updateMaisonMereAAPLegalValidationDecisionMutate } =
    useUpdateMaisonMereAAPLegalValidationDecision(maisonMereAAPId);

  const { mutateAsync: sendTotalUpdateRequest, isPending } = useMutation({
    mutationFn: ({ makeInvisible }: { makeInvisible: boolean }) =>
      updateMaisonMereAAPLegalValidationDecisionMutate({
        data: {
          maisonMereAAPId,
          decision: "DEMANDE_DE_MISE_A_JOUR_TOTALE",
          aapComment: TOTAL_UPDATE_REQUEST_COMMENT,
          makeInvisible,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [maisonMereAAPId] });
    },
  });

  return { sendTotalUpdateRequest, isPending };
};
