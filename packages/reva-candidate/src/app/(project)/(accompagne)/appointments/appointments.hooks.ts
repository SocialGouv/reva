import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getPastAppointmentsQuery = graphql(`
  query getPastAppointments($limit: Int, $offset: Int) {
    candidate_getCandidateWithCandidacy {
      candidacy {
        appointments(
          limit: $limit
          offset: $offset
          temporalStatusFilter: PAST
        ) {
          rows {
            id
            title
            date
            time
            type
          }
          info {
            totalRows
          }
        }
      }
    }
  }
`);

const getFutureAppointmentsQuery = graphql(`
  query getFutureAppointments($limit: Int, $offset: Int) {
    candidate_getCandidateWithCandidacy {
      candidacy {
        appointments(
          limit: $limit
          offset: $offset
          temporalStatusFilter: UPCOMING
        ) {
          rows {
            id
            title
            date
            time
            type
          }
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

  const { data: getPastAppointmentsQueryData } = useQuery({
    queryKey: [pastLimit, pastOffset, "pastAppointments"],
    queryFn: () =>
      graphqlClient.request(getPastAppointmentsQuery, {
        limit: pastLimit,
        offset: pastOffset,
      }),
  });

  const { data: getFutureAppointmentsQueryData } = useQuery({
    queryKey: [futureLimit, futureOffset, "futureAppointments"],
    queryFn: () =>
      graphqlClient.request(getFutureAppointmentsQuery, {
        limit: futureLimit,
        offset: futureOffset,
      }),
  });

  return {
    pastAppointments:
      getPastAppointmentsQueryData?.candidate_getCandidateWithCandidacy
        ?.candidacy?.appointments?.rows || [],
    totalPastAppointments:
      getPastAppointmentsQueryData?.candidate_getCandidateWithCandidacy
        ?.candidacy?.appointments?.info?.totalRows || 0,
    futureAppointments:
      getFutureAppointmentsQueryData?.candidate_getCandidateWithCandidacy
        ?.candidacy?.appointments?.rows || [],
  };
};
