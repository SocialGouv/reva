"use server";

import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  errors?: {
    name?: { message: string };
  };
};

const createCohortMutation = graphql(`
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
`);

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

  const result = throwUrqlErrors(
    await client.mutation(
      createCohortMutation,
      {
        commanditaireVaeCollectiveId: commanditaireId.toString(),
        nomCohorteVaeCollective: name.toString(),
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

  if (!result.data?.vaeCollective_createCohorteVaeCollective) {
    throw new Error("Cohorte non trouvée");
  }

  redirect(
    `/commanditaires/${commanditaireId}/cohortes/${result.data?.vaeCollective_createCohorteVaeCollective.id}`,
  );
};
