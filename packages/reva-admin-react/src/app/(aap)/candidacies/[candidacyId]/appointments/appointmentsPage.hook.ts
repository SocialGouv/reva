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

  const appointments =
    getCandidacyAppointmentsData?.getCandidacyById?.appointments;

  return { appointments };
};
