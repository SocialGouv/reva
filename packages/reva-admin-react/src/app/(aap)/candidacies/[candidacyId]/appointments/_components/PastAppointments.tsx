import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { AppointmentType } from "@/graphql/generated/graphql";

import { AppointmentCard } from "./AppointmentCard";

const getCandidacyAndPastAppointments = graphql(`
  query getCandidacyAndPastAppointmentsForAppointmentsPage(
    $candidacyId: ID!
    $limit: Int
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      appointments(
        limit: $limit
        temporalStatusFilter: PAST
        sortBy: DATE_ASC
      ) {
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

export const PastAppointments = ({ candidacyId }: { candidacyId: string }) => {
  const [pastAppointmentsLimit, setPastAppointmentsLimit] = useState(5);

  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyAndPastAppointmentsData } = useQuery({
    queryKey: [
      candidacyId,
      pastAppointmentsLimit,
      "getCandidacyAndPastAppointmentsForAppointmentsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyAndPastAppointments, {
        candidacyId,
        limit: pastAppointmentsLimit,
      }),
  });

  const pastAppointmentsPage =
    getCandidacyAndPastAppointmentsData?.getCandidacyById?.appointments;

  const pastAppointments = pastAppointmentsPage?.rows || [];

  const showViewMoreButton =
    (pastAppointmentsPage?.info?.totalRows || 0) > pastAppointmentsLimit;

  return (
    <PastAppointmentsContent
      pastAppointments={pastAppointments}
      candidacyId={candidacyId}
      showViewMoreButton={showViewMoreButton}
      onViewMoreButtonClick={() =>
        setPastAppointmentsLimit(pastAppointmentsLimit + 5)
      }
    />
  );
};

const PastAppointmentsContent = ({
  pastAppointments,
  candidacyId,
  showViewMoreButton,
  onViewMoreButtonClick,
}: {
  pastAppointments: {
    id: string;
    type: AppointmentType;
    date: string;
    time?: string;
    title: string;
  }[];
  candidacyId: string;
  showViewMoreButton: boolean;
  onViewMoreButtonClick: () => void;
}) => (
  <Accordion
    label="Rendez-vous passés"
    className={`${pastAppointments.length > 0 ? "" : "hidden"}`}
  >
    <div className="flex flex-col gap-4">
      <ul
        className="pl-0 flex flex-col gap-4"
        data-test="past-appointments-list"
      >
        {pastAppointments.map((appointment) => (
          <li key={appointment.id} className="list-none">
            <AppointmentCard
              appointment={appointment}
              candidacyId={candidacyId}
              disabled
            />
          </li>
        ))}
      </ul>
      {showViewMoreButton && (
        <Button
          priority="tertiary no outline"
          className="ml-auto"
          onClick={onViewMoreButtonClick}
        >
          Voir plus
        </Button>
      )}
    </div>
  </Accordion>
);
