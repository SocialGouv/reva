import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const organismQuery = graphql(`
  query getOrganismForOrganismVisibilityToggle($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      fermePourAbsenceOuConges
    }
  }
`);

const updateOrganismVisibilityMutation = graphql(`
  mutation updateOrganismVisibilityForOrganismVisibilityToggle(
    $organismId: ID!
    $fermePourAbsenceOuConges: Boolean!
  ) {
    organism_updateFermePourAbsenceOuConges(
      organismId: $organismId
      fermePourAbsenceOuConges: $fermePourAbsenceOuConges
    ) {
      id
    }
  }
`);

export const OrganismVisibilityToggle = ({
  organismId,
}: {
  organismId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: organismResponse } = useQuery({
    queryKey: [organismId, "organisms", "organism_visibility_toggle"],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const organism = organismResponse?.organism_getOrganism;

  const updateFermePourAbsenceOuConges = useMutation({
    mutationFn: ({
      organismId,
      fermePourAbsenceOuConges,
    }: {
      organismId: string;
      fermePourAbsenceOuConges: boolean;
    }) =>
      graphqlClient.request(updateOrganismVisibilityMutation, {
        organismId,
        fermePourAbsenceOuConges,
      }),
  });

  const handleVisibilityChange = async (checked: boolean) => {
    try {
      await updateFermePourAbsenceOuConges.mutateAsync({
        organismId: organism?.id,
        fermePourAbsenceOuConges: !checked,
      });
      queryClient.invalidateQueries({
        queryKey: [organism?.id],
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col border-t border-t-neutral-200 border-b border-b-neutral-200 py-4">
      <ToggleSwitch
        label="Je souhaite que la structure soit disponible dans les résultats de recherche"
        inputTitle="Je souhaite que la structure soit disponible dans les résultats de recherche"
        labelPosition="left"
        showCheckedHint={false}
        checked={!organism?.fermePourAbsenceOuConges}
        onChange={(checked) => handleVisibilityChange(checked)}
      />
    </div>
  );
};
