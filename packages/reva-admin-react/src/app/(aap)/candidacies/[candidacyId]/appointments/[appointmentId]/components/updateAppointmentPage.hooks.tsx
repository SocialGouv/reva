import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateAppointmentInput } from "@/graphql/generated/graphql";

const updateAppointmentMutation = graphql(`
  mutation updateAppointmentForUpdateAppointmentPage(
    $input: UpdateAppointmentInput!
  ) {
    appointment_updateAppointment(input: $input) {
      id
    }
  }
`);

const deleteAppointmentMutation = graphql(`
  mutation deleteAppointmentForUpdateAppointmentPage(
    $candidacyId: ID!
    $appointmentId: ID!
  ) {
    appointment_deleteAppointment(
      candidacyId: $candidacyId
      appointmentId: $appointmentId
    ) {
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

  const deleteAppointment = useMutation({
    mutationFn: ({
      candidacyId,
      appointmentId,
    }: {
      candidacyId: string;
      appointmentId: string;
    }) =>
      graphqlClient.request(deleteAppointmentMutation, {
        candidacyId,
        appointmentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId, appointmentId],
      });
    },
  });
  return { updateAppointment, deleteAppointment };
};
