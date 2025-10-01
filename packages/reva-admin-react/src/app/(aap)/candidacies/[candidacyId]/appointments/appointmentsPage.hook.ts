import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const getCandidacyAppointments = graphql(`
  query getCandidacyForAppointmentsPage(
    $candidacyId: ID!
    $offset: Int
    $limit: Int
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(limit: $limit, offset: $offset) {
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
  currentPage,
}: {
  candidacyId: string;
  currentPage: number;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const { data: getCandidacyAppointmentsData } = useQuery({
    queryKey: [candidacyId, currentPage, "getCandidacyForAppointmentsPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyAppointments, {
        candidacyId,
        offset,
        limit: RECORDS_PER_PAGE,
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
