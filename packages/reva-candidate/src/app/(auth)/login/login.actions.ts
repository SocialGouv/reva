"use server";
import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { redirect } from "next/navigation";

const CANDIDATE_ASK_FOR_LOGIN = graphql(`
  mutation candidate_askForLogin($email: String!) {
    candidate_askForLogin(email: $email)
  }
`);

export const doLogin = async (formData: FormData) => {
  const graphqlClient = getGraphQlClient();

  const email = formData.get("email") as string;
  if (!email) {
    throw new Error("Email is required");
  }

  const askForLogin = await graphqlClient.request(CANDIDATE_ASK_FOR_LOGIN, { email });
  if (askForLogin.candidate_askForLogin) {
    redirect("/login-confirmation");
  }
}
