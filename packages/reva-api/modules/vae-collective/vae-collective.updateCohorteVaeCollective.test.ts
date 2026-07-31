import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_RESOURCE_ACCESS,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

describe("update nom cohorte vae collective", () => {
  test("should let me update nom cohorte vae collective owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateNomCohorteVaeCollective = graphql(`
      mutation vaeCollective_updateNomCohorteVaeCollective(
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
      vaeCollective_updateNomCohorteVaeCollective,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        nomCohorteVaeCollective: "Nouveau nom",
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateNomCohorteVaeCollective: {
        id: cohorteVaeCollective.id,
        nom: "Nouveau nom",
      },
    });
  });

  test("should not let me update nom cohorte vae collective not owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateNomCohorteVaeCollective = graphql(`
      mutation vaeCollective_updateNomCohorteVaeCollective(
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
      graphqlClient.request(vaeCollective_updateNomCohorteVaeCollective, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: anotherCohorteVaeCollective.id,
        nomCohorteVaeCollective: "Nouveau nom",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should let an admin update nom of any cohorte vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const vaeCollective_updateNomCohorteVaeCollective = graphql(`
      mutation vaeCollective_updateNomCohorteVaeCollectiveAsAdmin(
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
          nom
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_updateNomCohorteVaeCollective,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        nomCohorteVaeCollective: "Nouveau nom par un admin",
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateNomCohorteVaeCollective: {
        id: cohorteVaeCollective.id,
        nom: "Nouveau nom par un admin",
      },
    });
  });

  test("should not let a user without an authorized role update nom cohorte vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const vaeCollective_updateNomCohorteVaeCollective = graphql(`
      mutation vaeCollective_updateNomCohorteVaeCollectiveUnauthorized(
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
          nom
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(vaeCollective_updateNomCohorteVaeCollective, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        nomCohorteVaeCollective: "Nouveau nom",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});

describe("update certification cohorte vae collective", () => {
  test("should not let me update certification cohorte vae collective if it is not in draft status", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      status: "PUBLIE",
    });
    const certification = await createCertificationHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveCertification = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveCertification(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $certificationIds: [ID!]!
      ) {
        vaeCollective_updateCohorteVAECollectiveCertification(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          certificationIds: $certificationIds
        ) {
          id
          certificationCohorteVaeCollectives {
            certification {
              id
            }
          }
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
      graphqlClient.request(
        vaeCollective_updateCohorteVAECollectiveCertification,
        {
          commanditaireVaeCollectiveId:
            cohorteVaeCollective.commanditaireVaeCollectiveId,
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
          certificationIds: [certification.id],
        },
      ),
    ).rejects.toThrowError(
      "Impossible de modifier la certification d'une cohorte si elle n'est pas dans l'état 'BROUILLON'",
    );
  });

  test("should let me update certification cohorte vae collective owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const certification = await createCertificationHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveCertification = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveCertification(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $certificationIds: [ID!]!
      ) {
        vaeCollective_updateCohorteVAECollectiveCertification(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          certificationIds: $certificationIds
        ) {
          id
          certificationCohorteVaeCollectives {
            certification {
              id
            }
          }
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
      vaeCollective_updateCohorteVAECollectiveCertification,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        certificationIds: [certification.id],
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateCohorteVAECollectiveCertification: {
        id: cohorteVaeCollective.id,
        certificationCohorteVaeCollectives: [
          {
            certification: {
              id: certification.id,
            },
          },
        ],
      },
    });
  });

  test("should not let me update nom cohorte vae collective not owned by commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();

    const certification = await createCertificationHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveCertification = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveCertification(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $certificationIds: [ID!]!
      ) {
        vaeCollective_updateCohorteVAECollectiveCertification(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          certificationIds: $certificationIds
        ) {
          id
          certificationCohorteVaeCollectives {
            certification {
              id
            }
          }
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
      graphqlClient.request(
        vaeCollective_updateCohorteVAECollectiveCertification,
        {
          commanditaireVaeCollectiveId:
            cohorteVaeCollective.commanditaireVaeCollectiveId,
          cohorteVaeCollectiveId: anotherCohorteVaeCollective.id,
          certificationIds: [certification.id],
        },
      ),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should let an admin update certification of any cohorte vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const certification = await createCertificationHelper();

    const vaeCollective_updateCohorteVAECollectiveCertification = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveCertificationAsAdmin(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $certificationIds: [ID!]!
      ) {
        vaeCollective_updateCohorteVAECollectiveCertification(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          certificationIds: $certificationIds
        ) {
          id
          certificationCohorteVaeCollectives {
            certification {
              id
            }
          }
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_updateCohorteVAECollectiveCertification,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        certificationIds: [certification.id],
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateCohorteVAECollectiveCertification: {
        id: cohorteVaeCollective.id,
        certificationCohorteVaeCollectives: [
          {
            certification: {
              id: certification.id,
            },
          },
        ],
      },
    });
  });

  test("should not let a user without an authorized role update certification cohorte vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const certification = await createCertificationHelper();

    const vaeCollective_updateCohorteVAECollectiveCertification = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveCertificationUnauthorized(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $certificationIds: [ID!]!
      ) {
        vaeCollective_updateCohorteVAECollectiveCertification(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          certificationIds: $certificationIds
        ) {
          id
          certificationCohorteVaeCollectives {
            certification {
              id
            }
          }
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(
        vaeCollective_updateCohorteVAECollectiveCertification,
        {
          commanditaireVaeCollectiveId:
            cohorteVaeCollective.commanditaireVaeCollectiveId,
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
          certificationIds: [certification.id],
        },
      ),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});

describe("update organism cohorte vae collective", () => {
  test("should not let me update organism cohorte vae collective if it is not in draft status", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      status: "PUBLIE",
    });
    const organism = await createOrganismHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganism(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
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
      graphqlClient.request(vaeCollective_updateCohorteVAECollectiveOrganism, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        organismId: organism.id,
      }),
    ).rejects.toThrowError(
      "Impossible de modifier l'aap d'une cohorte si elle n'est pas dans l'état 'BROUILLON'",
    );
  });

  test("should not let me update organism cohorte vae collective if the certification is not defined", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();
    const organism = await createOrganismHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganism(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
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
      graphqlClient.request(vaeCollective_updateCohorteVAECollectiveOrganism, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        organismId: organism.id,
      }),
    ).rejects.toThrowError(
      "Impossible de modifier l'aap d'une cohorte si la certification n'est pas définie",
    );
  });

  test("should let me update organism cohorte vae collective owned by commanditaire vae collective", async () => {
    const certification = await createCertificationHelper();
    const organism = await createOrganismHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      organism: { connect: { id: organism.id } },
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
        },
      },
    });

    const anotherOrganism = await createOrganismHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganism(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
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
      vaeCollective_updateCohorteVAECollectiveOrganism,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        organismId: anotherOrganism.id,
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateCohorteVAECollectiveOrganism: {
        id: cohorteVaeCollective.id,
        organism: {
          id: anotherOrganism.id,
        },
      },
    });
  });

  test("should not let me update organism cohorte vae collective not owned by commanditaire vae collective", async () => {
    const certification = await createCertificationHelper();
    const organism = await createOrganismHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      organism: { connect: { id: organism.id } },
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
        },
      },
    });

    const anotherCohorteVaeCollective =
      await createCohorteVaeCollectiveHelper();
    const anotherOrganism = await createOrganismHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganism(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
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
      graphqlClient.request(vaeCollective_updateCohorteVAECollectiveOrganism, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: anotherCohorteVaeCollective.id,
        organismId: anotherOrganism.id,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_RESOURCE_ACCESS);
  });

  test("should let an admin update organism of any cohorte vae collective", async () => {
    const certification = await createCertificationHelper();
    const organism = await createOrganismHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
        },
      },
    });

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganismAsAdmin(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
        }
      }
    `);
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
        }),
      },
    });

    const res = await graphqlClient.request(
      vaeCollective_updateCohorteVAECollectiveOrganism,
      {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        organismId: organism.id,
      },
    );

    expect(res).toMatchObject({
      vaeCollective_updateCohorteVAECollectiveOrganism: {
        id: cohorteVaeCollective.id,
        organism: {
          id: organism.id,
        },
      },
    });
  });

  test("should not let a user without an authorized role update organism cohorte vae collective", async () => {
    const certification = await createCertificationHelper();
    const organism = await createOrganismHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: {
          certification: { connect: { id: certification.id } },
        },
      },
    });

    const vaeCollective_updateCohorteVAECollectiveOrganism = graphql(`
      mutation vaeCollective_updateCohorteVAECollectiveOrganismUnauthorized(
        $commanditaireVaeCollectiveId: ID!
        $cohorteVaeCollectiveId: ID!
        $organismId: ID!
      ) {
        vaeCollective_updateCohorteVAECollectiveOrganism(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          organismId: $organismId
        ) {
          id
          organism {
            id
          }
        }
      }
    `);
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(vaeCollective_updateCohorteVAECollectiveOrganism, {
        commanditaireVaeCollectiveId:
          cohorteVaeCollective.commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        organismId: organism.id,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });
});
