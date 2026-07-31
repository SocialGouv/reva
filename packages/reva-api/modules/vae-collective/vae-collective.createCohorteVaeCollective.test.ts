import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_RESOURCE_ACCESS,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const vaeCollective_createCohorteVaeCollective = graphql(`
  mutation vaeCollective_createCohorteVaeCollective(
    $commanditaireVaeCollectiveId: ID!
    $nomCohorteVaeCollective: String!
  ) {
    vaeCollective_createCohorteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      nomCohorteVaeCollective: $nomCohorteVaeCollective
    ) {
      id
      nom
      status
      commanditaireVaeCollective {
        id
      }
    }
  }
`);

describe("create cohorte vae collective", () => {
  test("should let the gestionnaire create a cohorte for their commanditaire", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;
    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_vae_collective",
          keycloakId: userKeycloakId,
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_createCohorteVaeCollective,
      {
        commanditaireVaeCollectiveId,
        nomCohorteVaeCollective: "Ma nouvelle cohorte",
      },
    );

    expect(res).toMatchObject({
      vaeCollective_createCohorteVaeCollective: {
        nom: "Ma nouvelle cohorte",
        status: "BROUILLON",
        commanditaireVaeCollective: {
          id: commanditaireVaeCollectiveId,
        },
      },
    });

    const createdCohorte = await prismaClient.cohorteVaeCollective.findUnique({
      where: {
        id: res.vaeCollective_createCohorteVaeCollective.id,
      },
    });

    expect(createdCohorte).toMatchObject({
      nom: "Ma nouvelle cohorte",
      commanditaireVaeCollectiveId,
    });
  });

  test("should let an admin create a cohorte for any commanditaire", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_createCohorteVaeCollective,
      {
        commanditaireVaeCollectiveId,
        nomCohorteVaeCollective: "Cohorte créée par un admin",
      },
    );

    expect(res).toMatchObject({
      vaeCollective_createCohorteVaeCollective: {
        nom: "Cohorte créée par un admin",
        status: "BROUILLON",
        commanditaireVaeCollective: {
          id: commanditaireVaeCollectiveId,
        },
      },
    });
  });

  test("should not let a gestionnaire create a cohorte for a commanditaire they don't manage", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_vae_collective",
          keycloakId: userKeycloakId,
        }),
      },
    });

    await expect(
      graphqlClient.request(vaeCollective_createCohorteVaeCollective, {
        commanditaireVaeCollectiveId:
          anotherCohorteVaeCollective.commanditaireVaeCollectiveId,
        nomCohorteVaeCollective: "Cohorte interdite",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should not let a user without an authorized role create a cohorte", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(vaeCollective_createCohorteVaeCollective, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        nomCohorteVaeCollective: "Cohorte interdite",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});
