"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { gql } from "@urql/core";
import { redirect } from "next/navigation";

type FormState = {
  errors?: {
    name?: { message: string };
  };
};

const createCohortMutation = gql`
  mutation createCohorteVaeCollective(
    $commanditaireVaeCollectiveId: ID!
    $nomCohorteVaeCollective: String!
  ) {
    vaeCollective_createCohorteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      nomCohorteVaeCollective: $nomCohorteVaeCollective
    ) {
      id
    }
  }
`;

export const createCohort = async (_state: FormState, formData: FormData) => {
  const accessToken = await getAccessTokenFromCookie();

  const { name, commanditaireId } = Object.fromEntries(formData.entries());

  if (!name) {
    return {
      errors: {
        name: { message: "Merci de remplir ce champ" },
      },
    } as FormState;
  }

  if (name.toString().length < 5) {
    return {
      errors: {
        name: { message: "Ce champ doit contenir au moins 5 caractères" },
      },
    } as FormState;
  }

  throwUrqlErrors(
    await client.mutation(
      createCohortMutation,
      {
        commanditaireVaeCollectiveId: commanditaireId,
        nomCohorteVaeCollective: name,
      },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ),
  );

  redirect(`/commanditaires/${commanditaireId}/cohortes`);
};
