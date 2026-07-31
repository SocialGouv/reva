import { NOT_AUTHORIZED } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const vaeCollective_commanditaireVaeCollectives = graphql(`
  query vaeCollective_commanditaireVaeCollectives(
    $offset: Int
    $limit: Int
    $searchFilter: String
  ) {
    vaeCollective_commanditaireVaeCollectives(
      offset: $offset
      limit: $limit
      searchFilter: $searchFilter
    ) {
      rows {
        id
        raisonSociale
      }
      info {
        totalRows
      }
    }
  }
`);

const getCommanditaireVaeCollectives = (
  variables: {
    offset?: number;
    limit?: number;
    searchFilter?: string;
  },
  role: KeyCloakUserRole,
) => {
  const graphqlClient = getGraphQLClient({
    headers: role
      ? {
          authorization: authorizationHeaderForUser({
            role,
            keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
          }),
        }
      : {},
  });

  return graphqlClient.request(
    vaeCollective_commanditaireVaeCollectives,
    variables,
  );
};

describe("get commanditaires vae collective", () => {
  test("should let an admin list commanditaires vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const res = await getCommanditaireVaeCollectives(
      { offset: 0, limit: 10 },
      "admin",
    );

    expect(
      res.vaeCollective_commanditaireVaeCollectives.rows.map((row) => row.id),
    ).toContain(cohorteVaeCollective.commanditaireVaeCollectiveId);
  });

  test("should filter commanditaires vae collective by raison sociale", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    await prismaClient.commanditaireVaeCollective.update({
      where: { id: cohorteVaeCollective.commanditaireVaeCollectiveId },
      data: { raisonSociale: "Une raison sociale bien identifiable" },
    });

    const res = await getCommanditaireVaeCollectives(
      {
        offset: 0,
        limit: 10,
        searchFilter: "bien identifiable",
      },
      "admin",
    );

    expect(res.vaeCollective_commanditaireVaeCollectives.rows).toMatchObject([
      { id: cohorteVaeCollective.commanditaireVaeCollectiveId },
    ]);
  });

  test("should not let a non admin user list commanditaires vae collective", async () => {
    await expect(
      getCommanditaireVaeCollectives(
        { offset: 0, limit: 10 },
        "manage_vae_collective",
      ),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});
