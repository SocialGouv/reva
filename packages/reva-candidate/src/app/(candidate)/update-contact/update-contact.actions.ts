"use server";

import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { revalidatePath } from "next/cache";

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

export const updateContact = async (formData: FormData) => {
  const graphqlClient = getGraphQlClient();

  const candidateId = formData.get("candidateId") as string;
  const candidateData = {
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
  };

  const updateContact = await graphqlClient.request(UPDATE_CONTACT, {
    candidateId,
    candidateData,
  });

  revalidatePath("/update-contact");

  return updateContact.candidacy_updateContact;
};
