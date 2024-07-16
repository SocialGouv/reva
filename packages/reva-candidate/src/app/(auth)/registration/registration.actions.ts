"use server";

import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { redirect } from "next/navigation";

const CANDIDATE_ASK_FOR_REGISTRATION = graphql(`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

export const registerCandidate = async (input: FormData) => {
  const graphqlClient = getGraphQlClient();

  const email = input.get("email") as string;
  if (!email) {
    throw new Error("Email is required");
  }

  const firstname = input.get("firstname") as string;
  if (!firstname) {
    throw new Error("Firstname is required");
  }

  const lastname = input.get("lastname") as string;
  if (!lastname) {
    throw new Error("Lastname is required");
  }

  const phone = input.get("phone") as string;
  if (!phone) {
    throw new Error("Phone is required");
  }

  const departmentId = input.get("department") as string;
  if (!departmentId) {
    throw new Error("Department is required");
  }

  const askForRegistration = await graphqlClient.request(
    CANDIDATE_ASK_FOR_REGISTRATION,
    {
      candidate: {
        email,
        firstname,
        lastname,
        phone,
        departmentId,
      },
    },
  );

  if (askForRegistration.candidate_askForRegistration) {
    redirect('/registration-confirmation');
  };
};
