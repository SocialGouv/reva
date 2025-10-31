import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { AppointmentType } from "@/graphql/generated/graphql";

import { AppointmentCard } from "./AppointmentCard";

const RECORDS_PER_PAGE = 5;

const getCandidacyAndUpcomingAppointments = graphql(`
  query getCandidacyAndUpcomingAppointmentsForAppointmentsPage(
    $candidacyId: ID!
    $limit: Int
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(
        limit: $limit
        temporalStatusFilter: UPCOMING
        sortBy: DATE_ASC
      ) {
        rows {
          id
          date
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

export const UpcomingAppointments = ({
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

  const upcomingAppointments =
    getCandidacyAndUpcomingAppointmentsData?.getCandidacyById?.appointments;

  if (!upcomingAppointments) {
    return null;
  }

  return (
    <UpcomingAppointmentsContent
      candidacyId={candidacyId}
      upcomingAppointments={upcomingAppointments.rows}
    />
  );
};

const UpcomingAppointmentsContent = ({
  candidacyId,
  upcomingAppointments,
}: {
  candidacyId: string;
  upcomingAppointments: {
    id: string;
    type: AppointmentType;
    date: string;
    time?: string;
    title: string;
  }[];
}) =>
  !!upcomingAppointments ? (
    <ul
      className="pl-0 flex flex-col gap-4"
      data-testid="upcoming-appointments-list"
    >
      {upcomingAppointments.map((appointment) => (
        <li key={appointment.id}>
          <AppointmentCard
            appointment={appointment}
            candidacyId={candidacyId}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p>Aucun rendez-vous à venir</p>
  );
