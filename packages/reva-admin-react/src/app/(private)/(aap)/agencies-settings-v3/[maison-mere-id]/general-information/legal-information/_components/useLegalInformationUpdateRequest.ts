import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUpdateMaisonMereAAPLegalValidationDecision } from "@/app/(private)/(admin)/maisonMereAAPs/[maisonMereAAPId]/(components)/useUpdateMaisonMereAAPLegalValidationDecision";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const TOTAL_UPDATE_REQUEST_COMMENT =
  "France VAE vous demande de mettre à jour l'ensemble de vos informations générales et de vos pièces justificatives.";

const updateMaisonMereOrganismsIsActiveMutation = graphql(`
  mutation updateMaisonMereOrganismsIsActiveForTotalUpdateRequest(
    $data: UpdateMaisonMereOrganismsIsActiveInput!
  ) {
    organism_updateMaisonMereOrganismsIsActive(data: $data)
  }
`);

export const useLegalInformationUpdateRequest = (maisonMereAAPId: string) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { updateMaisonMereAAPLegalValidationDecisionMutate } =
    useUpdateMaisonMereAAPLegalValidationDecision(maisonMereAAPId);

  const { mutateAsync: sendTotalUpdateRequest, isPending } = useMutation({
    mutationFn: async ({ makeInvisible }: { makeInvisible: boolean }) => {
      // Les deux appels ne sont pas transactionnels: la demande passe en premier
      // pour ne jamais rendre la structure invisible sans l'avoir prévenue.
      await updateMaisonMereAAPLegalValidationDecisionMutate({
        data: {
          maisonMereAAPId,
          decision: "DEMANDE_DE_PRECISION",
          aapComment: TOTAL_UPDATE_REQUEST_COMMENT,
        },
      });

      if (makeInvisible) {
        await graphqlClient.request(updateMaisonMereOrganismsIsActiveMutation, {
          data: { maisonMereAAPId, isActive: false },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [maisonMereAAPId] });
    },
  });

  return { sendTotalUpdateRequest, isPending };
};
