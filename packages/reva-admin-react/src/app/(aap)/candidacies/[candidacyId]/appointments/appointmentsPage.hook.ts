import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const getCandidacyAndUpcomingAppointments = graphql(`
  query getCandidacyAndUpcomingAppointmentsForAppointmentsPage(
    $candidacyId: ID!
    $limit: Int
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(limit: $limit, temporalStatusFilter: UPCOMING) {
        rows {
          id
          date
          time
          type
          title
          temporalStatus
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

  const { data: getCandidacyAndUpcomingAppointmentsData } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyAndUpcomingAppointmentsForAppointmentsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyAndUpcomingAppointments, {
        candidacyId,
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

  const upcomingAppointments =
    getCandidacyAndUpcomingAppointmentsData?.getCandidacyById?.appointments;

  const rendezVousPedagogiqueMissing =
    !getRendezVousPedagogiqueData?.getCandidacyById?.appointments?.rows?.length;

  return {
    upcomingAppointments,
    rendezVousPedagogiqueMissing,
  };
};
