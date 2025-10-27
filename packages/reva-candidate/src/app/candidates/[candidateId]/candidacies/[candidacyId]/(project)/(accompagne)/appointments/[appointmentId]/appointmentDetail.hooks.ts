import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getOrganismQuery = graphql(`
  query getOrganism($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      organism {
        nomPublic
        label
      }
    }
  }
`);

const getAppointmentDetailsQuery = graphql(`
  query getAppointmentDetails($appointmentId: ID!, $candidacyId: ID!) {
    appointment_getAppointmentById(
      appointmentId: $appointmentId
      candidacyId: $candidacyId
    ) {
      id
      title
      date
      type
      description
      duration
      location
    }
  }
`);

export const useAppointmentDetail = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId, appointmentId } = useParams<{
    candidacyId: string;
    appointmentId: string;
  }>();

  const { data: getAppointmentDetailsQueryData } = useQuery({
    queryKey: [appointmentId, "appointmentDetails"],
    queryFn: () =>
      graphqlClient.request(getAppointmentDetailsQuery, {
        candidacyId,
        appointmentId,
      }),
  });

  const { data: getOrganismQueryData } = useQuery({
    queryKey: [candidacyId, "Organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        candidacyId,
      }),
  });

  return {
    appointment: getAppointmentDetailsQueryData?.appointment_getAppointmentById,
    organism: getOrganismQueryData?.getCandidacyById?.organism,
  };
};
