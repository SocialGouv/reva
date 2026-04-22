import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const organismQuery = graphql(`
  query getOrganismForOrganismDisponiblePourVaeCollectiveToggle(
    $organismId: ID!
  ) {
    organism_getOrganism(id: $organismId) {
      id
      disponiblePourVaeCollective
    }
  }
`);

const updateOrganismDisponiblePourVaeCollectiveMutation = graphql(`
  mutation updateOrganismDisponiblePourVaeCollectiveMutation(
    $organismId: ID!
    $disponiblePourVaeCollective: Boolean!
  ) {
    organism_updateDisponiblePourVaeCollective(
      organismId: $organismId
      disponiblePourVaeCollective: $disponiblePourVaeCollective
    ) {
      id
    }
  }
`);

export const OrganismDisponiblePourVaeCollectiveToggle = ({
  organismId,
  ToggleLabel,
}: {
  organismId: string;
  ToggleLabel: ReactNode;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: organismResponse } = useQuery({
    queryKey: [
      organismId,
      "organisms",
      "organism_disponible_pour_vae_collective_toggle",
    ],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const organism = organismResponse?.organism_getOrganism;

  const updateOrganismDisponiblePourVaeCollective = useMutation({
    mutationFn: ({
      organismId,
      disponiblePourVaeCollective,
    }: {
      organismId: string;
      disponiblePourVaeCollective: boolean;
    }) =>
      graphqlClient.request(updateOrganismDisponiblePourVaeCollectiveMutation, {
        organismId,
        disponiblePourVaeCollective,
      }),
  });

  const handleDisponiblePourVaeCollectiveChange = async (checked: boolean) => {
    try {
      await updateOrganismDisponiblePourVaeCollective.mutateAsync({
        organismId: organism?.id,
        disponiblePourVaeCollective: checked,
      });
      queryClient.invalidateQueries({
        queryKey: [organism?.id],
      });
      successToast("Disponibilité pour la VAE collective mise à jour");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      <ToggleSwitch
        label={ToggleLabel}
        inputTitle="Je souhaite activer la VAE collective à distance ou en présentiel"
        labelPosition="left"
        showCheckedHint={false}
        checked={organism?.disponiblePourVaeCollective}
        onChange={(checked) => handleDisponiblePourVaeCollectiveChange(checked)}
      />
      <p className="text-xs text-dsfr-light-text-mention-grey mb-0">
        Ce référencement vous permet d'être visible dans les résultats de
        recherche des porteurs de projet VAE collective.
      </p>
    </div>
  );
};
