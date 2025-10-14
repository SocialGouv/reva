"use server";

import { redirect } from "next/navigation";

import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  password?: string;
  passwordConfirmation?: string;
  errors?: {
    password?: { message: string };
    passwordConfirmation?: { message: string };
  };
};

const resetPasswordMutation = graphql(`
  mutation resetPassword($token: String!, $password: String!) {
    account_resetPassword(token: $token, password: $password)
  }
`);

export const resetPassword = async (state: FormState, formData: FormData) => {
  const password = formData.get("password")?.toString();
  const passwordConfirmation = formData.get("passwordConfirmation")?.toString();
  const resetPasswordToken =
    formData.get("resetPasswordToken")?.toString() || "";

  if (!password) {
    return {
      password,
      passwordConfirmation,
      errors: { password: { message: "Merci de saisir un mot de passe" } },
    } as FormState;
  }

  if (!passwordConfirmation) {
    return {
      password,
      passwordConfirmation,
      errors: {
        passwordConfirmation: {
          message: "Merci de confirmer votre mot de passe",
        },
      },
    } as FormState;
  }

  if (password !== passwordConfirmation) {
    return {
      password,
      passwordConfirmation,
      errors: {
        passwordConfirmation: {
          message: "Le mot de passe et sa confirmation ne correspondent pas",
        },
      },
    } as FormState;
  }

  throwUrqlErrors(
    await client.mutation(resetPasswordMutation, {
      token: resetPasswordToken,
      password,
    }),
  );

  redirect(encodeURI(`/reset-password-confirmation`));
};
