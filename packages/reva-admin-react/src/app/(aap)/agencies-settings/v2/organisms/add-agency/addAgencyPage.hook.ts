import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateAgencyInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const referentialQuery = graphql(`
  query getReferencialForCertificationsPage {
    getDegrees {
      id
      longLabel
      level
    }
    getDomaines {
      id
      label
    }
    getConventionCollectives {
      id
      label
    }
  }
`);

const createAgencyMutation = graphql(`
  mutation createAgencyMutationForAddAgencePage($data: CreateAgencyInput!) {
    organism_createAgency(data: $data)
  }
`);

export const useAgencyPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: referentialResponse, status: referentialStatus } = useQuery({
    queryKey: ["referential"],
    queryFn: () => graphqlClient.request(referentialQuery),
  });

  const createAgency = useMutation({
    mutationFn: (data: CreateAgencyInput) =>
      graphqlClient.request(createAgencyMutation, {
        data,
      }),
    mutationKey: ["organisms"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  const degrees = referentialResponse?.getDegrees || [];
  const domaines = referentialResponse?.getDomaines || [];

  return { degrees, domaines, createAgency };
};
