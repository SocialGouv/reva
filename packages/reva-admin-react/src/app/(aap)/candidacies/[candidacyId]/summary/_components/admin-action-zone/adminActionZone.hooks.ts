import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const updateCandidacyFinanceModuleToHorsPlateformeMutation = graphql(`
  mutation updateCandidacyFinanceModuleToHorsPlateforme(
    $candidacyId: UUID!
    $reason: String
  ) {
    candidacy_updateFinanceModule(
      candidacyId: $candidacyId
      financeModule: hors_plateforme
      reason: $reason
    ) {
      id
    }
  }
`);

const setCandidacyTypeAccompagnementToAutonomeMutation = graphql(`
  mutation setCandidacyTypeAccompagnementToAutonome(
    $candidacyId: UUID!
    $reason: String
  ) {
    candidacy_setTypeAccompagnementToAutonome(
      candidacyId: $candidacyId
      reason: $reason
    ) {
      id
    }
  }
`);

export const useAdminActionZone = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const queryClient = useQueryClient();

  const updateCandidacyFinanceModuleToHorsPlateforme = useMutation({
    mutationKey: [candidacyId],
    mutationFn: ({
      candidacyId,
      reason,
    }: {
      candidacyId: string;
      reason: string;
    }) =>
      graphqlClient.request(
        updateCandidacyFinanceModuleToHorsPlateformeMutation,
        { candidacyId, reason },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  const updateCandidacyTypeAccompagnementToAutonome = useMutation({
    mutationKey: [candidacyId],
    mutationFn: ({
      candidacyId,
      reason,
    }: {
      candidacyId: string;
      reason: string;
    }) =>
      graphqlClient.request(setCandidacyTypeAccompagnementToAutonomeMutation, {
        candidacyId,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  return {
    updateCandidacyFinanceModuleToHorsPlateforme,
    updateCandidacyTypeAccompagnementToAutonome,
  };
};
