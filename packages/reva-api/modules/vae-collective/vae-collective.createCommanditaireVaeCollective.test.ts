import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";
import * as getKeycloakAdminModule from "../shared/auth/getKeycloakAdmin";
import * as sendEmailUsingTemplate from "../shared/email/sendEmailUsingTemplate";

const createCommanditaireVaeCollective = async ({
  raisonSociale,
  gestionnaireFirstname,
  gestionnaireLastname,
  gestionnaireEmail,
}: {
  raisonSociale: string;
  gestionnaireFirstname: string;
  gestionnaireLastname: string;
  gestionnaireEmail: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
      }),
    },
  });

  const createCommanditaireVaeCollectiveMutation = graphql(`
    mutation createCommanditaireVaeCollective(
      $raisonSociale: String!
      $gestionnaireFirstname: String!
      $gestionnaireLastname: String!
      $gestionnaireEmail: String!
    ) {
      vaeCollective_createCommanditaireVaeCollective(
        raisonSociale: $raisonSociale
        gestionnaireFirstname: $gestionnaireFirstname
        gestionnaireLastname: $gestionnaireLastname
        gestionnaireEmail: $gestionnaireEmail
      ) {
        id
        raisonSociale
      }
    }
  `);

  return graphqlClient.request(createCommanditaireVaeCollectiveMutation, {
    raisonSociale,
    gestionnaireFirstname,
    gestionnaireLastname,
    gestionnaireEmail,
  });
};

describe("create commanditaire vae collective", () => {
  test("should create a commanditaire, an account and send an email to the account owner", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
      () =>
        Promise.resolve({
          users: {
            find: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({
              id: "02c1b842-c889-4db7-a4a6-2fad38e3d1fe",
            }),
          },
        }),
    );

    const emailSpy = vi.spyOn(sendEmailUsingTemplate, "sendEmailUsingTemplate");

    await createCommanditaireVaeCollective({
      raisonSociale: "Test Commanditaire",
      gestionnaireFirstname: "John",
      gestionnaireLastname: "Doe",
      gestionnaireEmail: "john.doe@example.com",
    });

    const commanditaire =
      await prismaClient.commanditaireVaeCollective.findFirst({
        where: {
          raisonSociale: "Test Commanditaire",
        },
      });

    expect(commanditaire).toBeDefined();

    const account = await prismaClient.account.findUnique({
      where: {
        id: commanditaire?.gestionnaireAccountId || "",
      },
    });

    expect(account).toBeDefined();
    expect(account?.email).toBe("john.doe@example.com");
    expect(account?.firstname).toBe("John");
    expect(account?.lastname).toBe("Doe");

    expect(emailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: { email: "john.doe@example.com" },
      }),
    );
  });
});
