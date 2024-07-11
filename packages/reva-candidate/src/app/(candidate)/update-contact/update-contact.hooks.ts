import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { UpdateCandidateInput } from "@/graphql/generated/graphql";

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

  const updateContact = useMutation({
    mutationKey: ["candidacy_updateContact"],
    mutationFn: ({
      candidateId,
      candidateData,
    }: {
      candidateId: string;
      candidateData: UpdateCandidateInput;
    }) => graphqlClient.request(UPDATE_CONTACT, { candidateId, candidateData }),
  });

  return { updateContact };
};
