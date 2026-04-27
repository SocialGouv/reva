"use server";

import { redirect } from "next/navigation";

import { publicApiClient } from "@/helpers/graphql/public-api-client/publicApiClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  password?: string;
  passwordConfirmation?: string;
  errors?: {
    password?: { message: string };
    passwordConfirmation?: { message: string };
    token?: { message: string };
  };
};

const resetPasswordMutation = graphql(`
  mutation resetPasswordAdmin($token: String!, $password: String!) {
    account_resetPassword(token: $token, password: $password)
  }
`);

export const resetPassword = async (_state: FormState, formData: FormData) => {
  const password = formData.get("password")?.toString();
  const passwordConfirmation = formData.get("passwordConfirmation")?.toString();
  const resetPasswordToken = formData.get("resetPasswordToken")?.toString();

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

  const result = await publicApiClient.mutation(resetPasswordMutation, {
    token: resetPasswordToken ?? "",
    password,
  });

  if (result.error) {
    return {
      password,
      passwordConfirmation,
      errors: {
        token: {
          message:
            "Votre lien de réinitialisation est expiré ou invalide. Merci de refaire une demande.",
        },
      },
    } as FormState;
  }

  redirect("/reset-password-confirmation");
};
