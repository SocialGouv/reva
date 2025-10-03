import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateAppointmentInput } from "@/graphql/generated/graphql";

const getCandidacyAndAppointmentQuery = graphql(`
  query getCandidacyAndAppointmentForUpdateAppointmentPage(
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
      time
      duration
      location
    }
  }
`);

const updateAppointmentMutation = graphql(`
  mutation updateAppointmentForUpdateAppointmentPage(
    $input: UpdateAppointmentInput!
  ) {
    appointment_updateAppointment(input: $input) {
      id
    }
  }
`);

export const useUpdateAppointmentPage = ({
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
      "getCandidacyAndAppointmentForUpdateAppointmentPage",
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
          "getCandidacyAndAppointmentForUpdateAppointmentPage",
        ],
      });
    },
  });

  const candidate = getCandidacyAndAppointmentData?.getCandidacyById?.candidate;
  const appointment =
    getCandidacyAndAppointmentData?.appointment_getAppointmentById;

  return { candidate, appointment, updateAppointment };
};
