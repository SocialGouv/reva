"use server";

import { redirect } from "next/navigation";

import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  errors?: {
    email?: { message: string };
  };
};

const sendForgotPasswordEmailMutation = graphql(`
  mutation account_sendForgotPasswordEmail($email: String!) {
    account_sendForgotPasswordEmail(
      email: $email
      clientApp: REVA_VAE_COLLECTIVE
    )
  }
`);

export const sendForgotPasswordEmail = async (
  _state: unknown,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();

  if (!email) {
    return {
      errors: { email: { message: "Email est requis" } },
    } as FormState;
  }

  throwUrqlErrors(
    await client.mutation(sendForgotPasswordEmailMutation, {
      email,
    }),
  );

  redirect(encodeURI(`/forgot-password-confirmation`));
};
