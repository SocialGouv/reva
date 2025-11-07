import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getPastAppointmentsQuery = graphql(`
  query getPastAppointments($candidacyId: ID!, $limit: Int, $offset: Int) {
    getCandidacyById(id: $candidacyId) {
      appointments(
        limit: $limit
        offset: $offset
        temporalStatusFilter: PAST
        sortBy: DATE_DESC
      ) {
        rows {
          id
          title
          date
          type
        }
        info {
          totalRows
        }
      }
    }
  }
`);

const getFutureAppointmentsQuery = graphql(`
  query getFutureAppointments($candidacyId: ID!, $limit: Int, $offset: Int) {
    getCandidacyById(id: $candidacyId) {
      appointments(
        limit: $limit
        offset: $offset
        temporalStatusFilter: UPCOMING
        sortBy: DATE_ASC
      ) {
        rows {
          id
          title
          date
          type
        }
      }
    }
  }
`);

export const useAppointments = ({
  pastLimit = 5,
  pastOffset = 0,
  futureLimit = 10,
  futureOffset = 0,
}: {
  pastLimit?: number;
  pastOffset?: number;
  futureLimit?: number;
  futureOffset?: number;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getPastAppointmentsQueryData } = useQuery({
    queryKey: [pastLimit, pastOffset, "pastAppointments", candidacyId],
    queryFn: () =>
      graphqlClient.request(getPastAppointmentsQuery, {
        candidacyId,
        limit: pastLimit,
        offset: pastOffset,
      }),
  });

  const { data: getFutureAppointmentsQueryData } = useQuery({
    queryKey: [futureLimit, futureOffset, "futureAppointments", candidacyId],
    queryFn: () =>
      graphqlClient.request(getFutureAppointmentsQuery, {
        candidacyId,
        limit: futureLimit,
        offset: futureOffset,
      }),
  });

  return {
    pastAppointments:
      getPastAppointmentsQueryData?.getCandidacyById?.appointments?.rows || [],
    totalPastAppointments:
      getPastAppointmentsQueryData?.getCandidacyById?.appointments?.info
        ?.totalRows || 0,
    futureAppointments:
      getFutureAppointmentsQueryData?.getCandidacyById?.appointments?.rows ||
      [],
  };
};
