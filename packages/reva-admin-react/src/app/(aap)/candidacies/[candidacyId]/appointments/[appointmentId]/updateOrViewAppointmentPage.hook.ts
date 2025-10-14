import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateAppointmentInput } from "@/graphql/generated/graphql";

const getCandidacyAndAppointmentQuery = graphql(`
  query getCandidacyAndAppointmentForUpdateOrViewAppointmentPage(
    $candidacyId: ID!
    $appointmentId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
      }
    }
    appointment_getAppointmentById(
      candidacyId: $candidacyId
      appointmentId: $appointmentId
    ) {
      id
      type
      title
      description
      date
      duration
      location
      temporalStatus
    }
  }
`);

const updateAppointmentMutation = graphql(`
  mutation updateAppointmentForUpdateOrViewAppointmentPage(
    $input: UpdateAppointmentInput!
  ) {
    appointment_updateAppointment(input: $input) {
      id
    }
  }
`);

export const useUpdateOrViewAppointmentPage = ({
  candidacyId,
  appointmentId,
}: {
  appointmentId: string;
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyAndAppointmentData } = useQuery({
    queryKey: [
      candidacyId,
      appointmentId,
      "getCandidacyAndAppointmentForUpdateOrViewAppointmentPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyAndAppointmentQuery, {
        candidacyId,
        appointmentId,
      }),
  });

  const updateAppointment = useMutation({
    mutationFn: (input: UpdateAppointmentInput) =>
      graphqlClient.request(updateAppointmentMutation, {
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          appointmentId,
          "getCandidacyAndAppointmentForUpdateOrViewAppointmentPage",
        ],
      });
    },
  });

  const candidate = getCandidacyAndAppointmentData?.getCandidacyById?.candidate;
  const appointment =
    getCandidacyAndAppointmentData?.appointment_getAppointmentById;

  return { candidate, appointment, updateAppointment };
};
