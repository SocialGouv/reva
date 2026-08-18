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
import { injectGraphql } from "@/test/helpers/graphql-helper";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const mutation = ({
  endpoint,
  authorization,
  arguments: mutationArguments,
  enumFields,
  returnFields,
}: {
  endpoint: string;
  authorization?: string;
  arguments?: Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "mutation",
      endpoint,
      arguments: mutationArguments,
      enumFields,
      returnFields,
    },
  });

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

      const response = await mutation({
        endpoint: "candidacy_takeOver",
        authorization,
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id status }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_takeOver).toMatchObject({
        id: candidacy.id,
        status: "PRISE_EN_CHARGE",
      });
    });

    test("rejects a maison mere manager from another maison mere", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.VALIDATION,
      });

      const response = await mutation({
        endpoint: "candidacy_takeOver",
        authorization: await createForeignMaisonMereManagerAuthorization(),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test.each(unsupportedProfessionalRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        const response = await mutation({
          endpoint: "candidacy_takeOver",
          authorization: asRole(role),
          arguments: { candidacyId: faker.string.uuid() },
          returnFields: "{ id }",
        });

        expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      const response = await mutation({
        endpoint: "candidacy_takeOver",
        arguments: { candidacyId: faker.string.uuid() },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });
});
