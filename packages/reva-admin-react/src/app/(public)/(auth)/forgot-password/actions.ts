"use server";

import { redirect } from "next/navigation";

import { publicApiClient } from "@/helpers/graphql/public-api-client/publicApiClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  errors?: {
    email?: { message: string };
  };
};

const sendForgotPasswordEmailMutation = graphql(`
  mutation account_sendForgotPasswordEmailAdmin($email: String!) {
    account_sendForgotPasswordEmail(email: $email, clientApp: REVA_ADMIN)
  }
`);

export const sendForgotPasswordEmail = async (
  _state: FormState,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();

  if (!email) {
    return {
      errors: { email: { message: "Adresse électronique requise" } },
    } as FormState;
  }

  // Anti-énumération : toujours rediriger vers la confirmation,
  // même si l'email n'existe pas ou si la mutation échoue.
  try {
    await publicApiClient.mutation(sendForgotPasswordEmailMutation, { email });
  } catch {
    // ignore
  }

  redirect("/forgot-password-confirmation");
};
