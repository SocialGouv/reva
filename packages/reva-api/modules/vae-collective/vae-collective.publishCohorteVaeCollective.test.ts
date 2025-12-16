import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const publishCohorteVAECollective = ({
  userKeycloakId,
  userRole,
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
}: {
  userKeycloakId: string;
  userRole: KeyCloakUserRole;
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: userRole,
        keycloakId: userKeycloakId,
      }),
    },
  });

  const publishCohorteVAECollectiveMutation = graphql(`
    mutation publishCohorteVAECollective(
      $commanditaireVaeCollectiveId: ID!
      $cohorteVaeCollectiveId: ID!
    ) {
      vaeCollective_publishCohorteVAECollective(
        commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
        cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      ) {
        id
        codeInscription
        status
      }
    }
  `);

  return graphqlClient.request(publishCohorteVAECollectiveMutation, {
    commanditaireVaeCollectiveId,
    cohorteVaeCollectiveId,
  });
};

describe("publish a cohorte vae collective", () => {
  test("should let me publish a valid cohorte vae collective and generate a valide code inscription", async () => {
    const certification = await createCertificationHelper();

    const organism = await createOrganismHelper();

    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      organism: { connect: { id: organism.id } },
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
          certificationCohorteVaeCollectiveOnOrganisms: {
            create: { organism: { connect: { id: organism.id } } },
          },
        },
      },
    });

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const response = await publishCohorteVAECollective({
      userKeycloakId,
      userRole: "manage_vae_collective",
      commanditaireVaeCollectiveId:
        cohorteVaeCollective.commanditaireVaeCollectiveId,
      cohorteVaeCollectiveId: cohorteVaeCollective.id,
    });

    const publishedCohorteVAECollective =
      response.vaeCollective_publishCohorteVAECollective;

    expect(publishedCohorteVAECollective.status).toBe("PUBLIE");
    expect(publishedCohorteVAECollective.codeInscription).toMatch(
      /[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}/,
    );
  });

  test("should not let me publish a cohorte vae collective if it is already published", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      status: "PUBLIE",
    });

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    await expect(
      publishCohorteVAECollective({
        userKeycloakId,
        userRole: "manage_vae_collective",
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
      }),
    ).rejects.toThrowError(
      "Impossible de publier une cohorte si son statut n'est pas 'BROUILLON'",
    );
  });

  test("should not let me publish a cohorte vae collective if it is not associated to a certification", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    await expect(
      publishCohorteVAECollective({
        userKeycloakId,
        userRole: "manage_vae_collective",
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
      }),
    ).rejects.toThrowError(
      "Impossible de publier une cohorte si elle n'a pas de certification associée",
    );
  });

  test("should not let me publish a cohorte vae collective if it is not associated to an organism", async () => {
    const certification = await createCertificationHelper();

    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
        },
      },
    });

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    await expect(
      publishCohorteVAECollective({
        userKeycloakId,
        userRole: "manage_vae_collective",
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
      }),
    ).rejects.toThrowError(
      "Impossible de publier une cohorte si elle n'a pas d'aap associé",
    );
  });
});
