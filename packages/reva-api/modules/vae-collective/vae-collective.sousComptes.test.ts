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

const vaeCollective_getCommanditaireVaeCollectiveSousComptes = graphql(`
  query vaeCollective_getCommanditaireVaeCollectiveSousComptes(
    $commanditaireVaeCollectiveId: ID!
    $offset: Int
    $limit: Int
  ) {
    vaeCollective_getCommanditaireVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
    ) {
      sousComptes(offset: $offset, limit: $limit) {
        rows {
          id
          account {
            id
            email
          }
        }
        info {
          totalRows
        }
      }
    }
  }
`);

const getSousComptes = ({
  commanditaireVaeCollectiveId,
  offset,
  limit,
  role,
  keycloakId,
}: {
  commanditaireVaeCollectiveId: string;
  offset?: number;
  limit?: number;
  role: KeyCloakUserRole;
  keycloakId?: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({ role, keycloakId }),
    },
  });

  return graphqlClient.request(
    vaeCollective_getCommanditaireVaeCollectiveSousComptes,
    { commanditaireVaeCollectiveId, offset, limit },
  );
};

describe("get sous comptes of a commanditaire vae collective", () => {
  test("should let the gestionnaire list the sous comptes of their own commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;
    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const sousCompteAccount = await createAccountHelper();
    const sousCompte = await prismaClient.sousCompteVaeCollective.create({
      data: {
        commanditaireVaeCollectiveId,
        accountId: sousCompteAccount.id,
      },
    });

    const res = await getSousComptes({
      commanditaireVaeCollectiveId,
      offset: 0,
      limit: 10,
      role: "manage_vae_collective",
      keycloakId: userKeycloakId,
    });

    expect(
      res.vaeCollective_getCommanditaireVaeCollective.sousComptes.rows,
    ).toMatchObject([
      {
        id: sousCompte.id,
        account: {
          id: sousCompteAccount.id,
          email: sousCompteAccount.email,
        },
      },
    ]);
    expect(
      res.vaeCollective_getCommanditaireVaeCollective.sousComptes.info
        .totalRows,
    ).toBe(1);
  });

  test("should let an admin list the sous comptes of any commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const commanditaireVaeCollectiveId =
      cohorteVaeCollective.commanditaireVaeCollectiveId;

    const sousCompteAccount = await createAccountHelper();
    await prismaClient.sousCompteVaeCollective.create({
      data: {
        commanditaireVaeCollectiveId,
        accountId: sousCompteAccount.id,
      },
    });

    const res = await getSousComptes({
      commanditaireVaeCollectiveId,
      offset: 0,
      limit: 10,
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    });

    expect(
      res.vaeCollective_getCommanditaireVaeCollective.sousComptes.rows.map(
        (row) => row.account.id,
      ),
    ).toContain(sousCompteAccount.id);
  });

  test("should not let a gestionnaire of a different commanditaire list the sous comptes", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    await expect(
      getSousComptes({
        commanditaireVaeCollectiveId:
          anotherCohorteVaeCollective.commanditaireVaeCollectiveId,
        offset: 0,
        limit: 10,
        role: "manage_vae_collective",
        keycloakId: userKeycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should not let a user without an authorized role list the sous comptes", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    await expect(
      getSousComptes({
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        offset: 0,
        limit: 10,
        role: "manage_candidacy",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});
