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

export const updateContact = async (prevState: unknown, formData: FormData) => {
  const graphqlClient = getGraphQlClient();

  const errors: Record<string, string> = {};

  const candidateId = formData.get("candidateId") as string;
  const candidateData = {
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
  };

  if (!candidateData.email) {
    errors["email"] = "Email is required";
  }
  if (!candidateData.firstname) {
    errors["firstname"] = "Firstname is required";
  }
  if (!candidateData.lastname) {
    errors["lastname"] = "Lastname is required";
  }
  if (!candidateData.phone) {
    errors["phone"] = "Phone is required";
  }

  await graphqlClient.request(UPDATE_CONTACT, {
    candidateId,
    candidateData,
  });

  if (Object.keys(errors).length === 0) {
    revalidatePath("/");
  }

  return {
    errors,
  };
};
