import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateCandidateInput } from "@/graphql/generated/graphql";

const GET_CANDIDATE_FOR_UPDATE_CONTACT = graphql(`
  query candidate_getCandidateForUpdateContact {
    candidate_getCandidateWithCandidacy {
      id
      firstname
      lastname
      phone
      email
    }
  }
`);

const UPDATE_CONTACT = graphql(`
  mutation update_contact(
    $candidateId: ID!
    $candidateData: UpdateCandidateInput!
  ) {
    candidacy_updateContact(
      candidateId: $candidateId
      candidateData: $candidateData
    ) {
      id
      firstname
      lastname
      phone
      email
    }
  }
`);

export const useUpdateContact = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["candidate", "updateContact"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_FOR_UPDATE_CONTACT),
  });
  const candidate = data?.candidate_getCandidateWithCandidacy;

  const updateContact = useMutation({
    mutationKey: ["candidacy_updateContact"],
    mutationFn: ({
      candidateId,
      candidateData,
    }: {
      candidateId: string;
      candidateData: UpdateCandidateInput;
    }) => graphqlClient.request(UPDATE_CONTACT, { candidateId, candidateData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate"] }),
  });

  return { updateContact, candidate, isLoading };
};
