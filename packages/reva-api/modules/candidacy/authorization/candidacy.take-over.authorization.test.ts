import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_takeOver = graphql(`
  mutation candidacy_takeOver_authorization($candidacyId: ID!) {
    candidacy_takeOver(candidacyId: $candidacyId) {
      id
      status
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const takeOver = ({
  authorization,
  candidacyId,
}: {
  authorization?: string;
  candidacyId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_takeOver, { candidacyId });
};

const createScopedMaisonMereManager = async ({
  status,
}: {
  status: CandidacyStatusStep;
}) => {
  const organism = await createOrganismHelper();
  const maisonMereAAP = organism.maisonMereAAP!;
  const siblingOrganism = await createOrganismHelper({
    maisonMereAAPId: maisonMereAAP.id,
  });
  await attachCollaborateurAccountToOrganism({
    organismId: siblingOrganism.id,
    collaborateurAccountId: maisonMereAAP.gestionnaire.id,
  });
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: status,
    candidacyArgs: { organismId: organism.id },
  });
  return {
    candidacy,
    authorization: asRole(
      "gestion_maison_mere_aap",
      maisonMereAAP.gestionnaire.keycloakId,
    ),
  };
};

const createForeignMaisonMereManagerAuthorization = async () => {
  const organism = await createOrganismHelper();
  const manager = organism.maisonMereAAP!.gestionnaire;
  await attachCollaborateurAccountToOrganism({
    organismId: organism.id,
    collaborateurAccountId: manager.id,
  });
  return asRole("gestion_maison_mere_aap", manager.keycloakId);
};

const unsupportedProfessionalRoles: KeyCloakUserRole[] = [
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

describe("candidacy professional and admin resolver authorization", () => {
  describe("candidacy_takeOver", () => {
    test("allows the maison mere manager to take over a candidacy in its scope", async () => {
      const { candidacy, authorization } = await createScopedMaisonMereManager({
        status: CandidacyStatusStep.VALIDATION,
      });

      const response = await takeOver({
        authorization,
        candidacyId: candidacy.id,
      });

      expect(response.candidacy_takeOver).toMatchObject({
        id: candidacy.id,
        status: "PRISE_EN_CHARGE",
      });
    });

    test("rejects a maison mere manager from another maison mere", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.VALIDATION,
      });

      await expect(
        takeOver({
          authorization: await createForeignMaisonMereManagerAuthorization(),
          candidacyId: candidacy.id,
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test.each(unsupportedProfessionalRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        await expect(
          takeOver({
            authorization: asRole(role),
            candidacyId: faker.string.uuid(),
          }),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      await expect(
        takeOver({ candidacyId: faker.string.uuid() }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });
});
