import { graphql } from "@/graphql/generated";
import { useMutation } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const updateOrganismMutation = graphql(`
  mutation updateOrganism(
    $organismId: ID!
    $organismData: UpdateOrganismInput!
  ) {
    organism_updateOrganism(
      organismId: $organismId
      organismData: $organismData
    ) {
      id
      label
      contactAdministrativeEmail
      contactAdministrativePhone
      website
      isActive
    }
  }
`);

export const useOrganismForm = () => {
  const { graphqlClient } = useGraphQlClient();

  const updateOrganism = useMutation({
    mutationFn: (params: {
      organismId: string;
      organismData: {
        label: string;
        contactAdministrativeEmail: string;
        contactAdministrativePhone?: string;
        website?: string;
        isActive: boolean;
      };
    }) => graphqlClient.request(updateOrganismMutation, params),
  });

  return { updateOrganism };
};
