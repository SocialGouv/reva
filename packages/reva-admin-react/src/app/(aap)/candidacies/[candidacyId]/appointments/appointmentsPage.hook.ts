import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyAppointments = graphql(`
  query getCandidacyForAppointmentsPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(limit: 30, offset: 0) {
        rows {
          id
          date
          time
          type
          title
        }
        info {
          totalRows
          currentPage
          totalPages
        }
      }
    }
  }
`);

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

  const { data: getCandidacyAppointmentsData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForAppointmentsPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyAppointments, {
        candidacyId,
      }),
  });

  const { data: getRendezVousPedagogiqueData } = useQuery({
    queryKey: [candidacyId, "getRendezVousPedagogiqueForAppointmentsPage"],
    queryFn: () =>
      graphqlClient.request(getRendezVousPedagogique, {
        candidacyId,
      }),
  });

  const appointments =
    getCandidacyAppointmentsData?.getCandidacyById?.appointments;

  const rendezVousPedagogiqueMissing =
    !getRendezVousPedagogiqueData?.getCandidacyById?.appointments?.rows?.length;

  return { appointments, rendezVousPedagogiqueMissing };
};
