"use server";

import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  name: string;
  errors?: {
    name?: { message: string };
  };
};

const updateNomCohorteVaeCollectiveMutation = graphql(`
  mutation updateNomCohorteVaeCollective(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $nomCohorteVaeCollective: String!
  ) {
    vaeCollective_updateNomCohorteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      nomCohorteVaeCollective: $nomCohorteVaeCollective
    ) {
      id
    }
  }
`);

const getCohorteByIdQuery = graphql(`
  query getCohorteByIdForUpdateCohorteNamePage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
    }
  }
`);

export const getCohorteById = async (
  commanditaireVaeCollectiveId: string,
  cohorteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getCohorteByIdQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
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

  return result.data?.vaeCollective_getCohorteVaeCollectiveById;
};

export const updateNomCohorteVaeCollective = async (
  _state: FormState,
  formData: FormData,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const { name, commanditaireId, cohorteVaeCollectiveId } = Object.fromEntries(
    formData.entries(),
  );

  if (!name) {
    return {
      name,
      errors: {
        name: { message: "Merci de remplir ce champ" },
      },
    } as FormState;
  }

  if (name.toString().length < 5) {
    return {
      name,
      errors: {
        name: { message: "Ce champ doit contenir au moins 5 caractères" },
      },
    } as FormState;
  }

  throwUrqlErrors(
    await client.mutation(
      updateNomCohorteVaeCollectiveMutation,
      {
        commanditaireVaeCollectiveId: commanditaireId.toString(),
        cohorteVaeCollectiveId: cohorteVaeCollectiveId.toString(),
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

  redirect(
    `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
  );
};
