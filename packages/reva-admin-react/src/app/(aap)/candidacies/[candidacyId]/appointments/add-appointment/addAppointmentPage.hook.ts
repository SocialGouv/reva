import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CreateAppointmentInput } from "@/graphql/generated/graphql";

const getCandidacyQuery = graphql(`
  query getCandidacyForAddAppointmentPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
      }
    }
  }
`);

const createAppointmentMutation = graphql(`
  mutation createAppointmentForAddAppointmentPage(
    $input: CreateAppointmentInput!
  ) {
    appointment_createAppointment(input: $input) {
      id
    }
  }
`);

export const useAddAppointmentPage = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForAddAppointmentPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const createAppointment = useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      graphqlClient.request(createAppointmentMutation, {
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId, "getCandidacyForAddAppointmentPage"],
      });
    },
  });

  const candidate = getCandidacyData?.getCandidacyById?.candidate;

  return { candidate, createAppointment };
};
