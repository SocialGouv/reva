import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

describe("get cohorte vae collective", () => {
  test("should let me get cohorte vae collective owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_getCohorteVaeCollectiveById = graphql(`
      query vaeCollective_getCohorteVaeCollectiveById(
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

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_vae_collective",
          keycloakId: userKeycloakId,
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_getCohorteVaeCollectiveById,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
      },
    );

    expect(res).toMatchObject({
      vaeCollective_getCohorteVaeCollectiveById: {
        id: cohorteVaeCollective.id,
        nom: cohorteVaeCollective.nom,
      },
    });
  });

  test("should not let me get cohorte vae collective not owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_getCohorteVaeCollectiveById = graphql(`
      query vaeCollective_getCohorteVaeCollectiveById(
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

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_vae_collective",
          keycloakId: userKeycloakId,
        }),
      },
    });

    await expect(
      graphqlClient.request(vaeCollective_getCohorteVaeCollectiveById, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: anotherCohorteVaeCollective.id,
      }),
    ).rejects.toThrowError(
      "Vous n'êtes pas autorisé à accéder à cette ressource",
    );
  });
});
