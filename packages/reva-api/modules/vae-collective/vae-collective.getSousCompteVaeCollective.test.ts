import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_RESOURCE_ACCESS,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const vaeCollective_getSousCompteVaeCollective = graphql(`
  query vaeCollective_getSousCompteVaeCollective(
    $commanditaireVaeCollectiveId: ID!
    $sousCompteVaeCollectiveId: ID!
  ) {
    vaeCollective_getSousCompteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      sousCompteVaeCollectiveId: $sousCompteVaeCollectiveId
    ) {
      id
      account {
        id
      }
    }
  }
`);

const getSousCompteVaeCollective = ({
  commanditaireVaeCollectiveId,
  sousCompteVaeCollectiveId,
  role,
  keycloakId,
}: {
  commanditaireVaeCollectiveId: string;
  sousCompteVaeCollectiveId: string;
  role: KeyCloakUserRole;
  keycloakId?: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({ role, keycloakId }),
    },
  });

  return graphqlClient.request(vaeCollective_getSousCompteVaeCollective, {
    commanditaireVaeCollectiveId,
    sousCompteVaeCollectiveId,
  });
};

const createSousCompteVaeCollectiveHelper = async ({
  commanditaireVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId: string;
}) => {
  const account = await createAccountHelper();
  return prismaClient.sousCompteVaeCollective.create({
    data: {
      commanditaireVaeCollectiveId,
      accountId: account.id,
    },
  });
};

describe("get sous compte vae collective", () => {
  test("should let the gestionnaire get a sous compte of their own commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;
    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId,
    });

    const res = await getSousCompteVaeCollective({
      commanditaireVaeCollectiveId,
      sousCompteVaeCollectiveId: sousCompte.id,
      role: "manage_vae_collective",
      keycloakId: userKeycloakId,
    });

    expect(res).toMatchObject({
      vaeCollective_getSousCompteVaeCollective: {
        id: sousCompte.id,
        account: { id: sousCompte.accountId },
      },
    });
  });

  test("should let an admin get a sous compte of any commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;

    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId,
    });

    const res = await getSousCompteVaeCollective({
      commanditaireVaeCollectiveId,
      sousCompteVaeCollectiveId: sousCompte.id,
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    });

    expect(res).toMatchObject({
      vaeCollective_getSousCompteVaeCollective: {
        id: sousCompte.id,
      },
    });
  });

  test("should not let a gestionnaire get a sous compte of a commanditaire vae collective they don't manage", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId:
        anotherCohorteVaeCollective.commanditaireVaeCollectiveId,
    });

    await expect(
      getSousCompteVaeCollective({
        commanditaireVaeCollectiveId:
          anotherCohorteVaeCollective.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompte.id,
        role: "manage_vae_collective",
        keycloakId: userKeycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should not let a gestionnaire get a sous compte that doesn't belong to the given commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const sousCompteOfAnotherCommanditaire =
      await createSousCompteVaeCollectiveHelper({
        commanditaireVaeCollectiveId:
          anotherCohorteVaeCollective.commanditaireVaeCollectiveId,
      });

    await expect(
      getSousCompteVaeCollective({
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompteOfAnotherCommanditaire.id,
        role: "manage_vae_collective",
        keycloakId: userKeycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should not let a user without an authorized role get a sous compte vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId:
        cohorteVaeCollective.commanditaireVaeCollectiveId,
    });

    await expect(
      getSousCompteVaeCollective({
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompte.id,
        role: "manage_candidacy",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});
