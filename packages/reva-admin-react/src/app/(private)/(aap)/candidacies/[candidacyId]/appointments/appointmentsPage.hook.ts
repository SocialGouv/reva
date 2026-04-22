import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getRendezVousPedagogique = graphql(`
  query getRendezVousPedagogiqueForAppointmentsPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(type: RENDEZ_VOUS_PEDAGOGIQUE) {
        rows {
          id
        }
      }
    }
  }
`);

export const useAppointmentsPage = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getRendezVousPedagogiqueData } = useQuery({
    queryKey: [candidacyId, "getRendezVousPedagogiqueForAppointmentsPage"],
    queryFn: () =>
      graphqlClient.request(getRendezVousPedagogique, {
        candidacyId,
      }),
  });

  const rendezVousPedagogiqueMissing =
    !getRendezVousPedagogiqueData?.getCandidacyById?.appointments?.rows?.length;

  return {
    rendezVousPedagogiqueMissing,
  };
};
