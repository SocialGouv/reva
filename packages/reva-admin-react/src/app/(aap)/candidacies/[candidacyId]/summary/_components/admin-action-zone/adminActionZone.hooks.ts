import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateCandidacyFinanceModuleToHorsPlateformeMutation = graphql(`
  mutation updateCandidacyFinanceModuleToHorsPlateforme($candidacyId: UUID!) {
    candidacy_updateFinanceModule(
      candidacyId: $candidacyId
      financeModule: hors_plateforme
    ) {
      id
    }
  }
`);

const updateCandidacyTypeAccompagnementToAutonomeMutation = graphql(`
  mutation updateCandidacyTypeAccompagnementToAutonome($candidacyId: UUID!) {
    candidacy_updateTypeAccompagnement(
      candidacyId: $candidacyId
      typeAccompagnement: AUTONOME
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
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(
        updateCandidacyFinanceModuleToHorsPlateformeMutation,
        { candidacyId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  const updateCandidacyTypeAccompagnementToAutonome = useMutation({
    mutationKey: [candidacyId],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(
        updateCandidacyTypeAccompagnementToAutonomeMutation,
        { candidacyId },
      ),
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
