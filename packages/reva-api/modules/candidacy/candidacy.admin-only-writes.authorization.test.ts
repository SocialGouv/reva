import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
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

interface MutationCase {
  endpoint: string;
  buildArguments: (candidacyId: string) => Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
}

const adminOnlyMutationCases: MutationCase[] = [
  {
    endpoint: "candidacy_selectOrganismAsAdmin",
    buildArguments: (candidacyId) => ({
      candidacyId,
      organismId: faker.string.uuid(),
    }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_validateDropOut",
    buildArguments: (candidacyId) => ({ candidacyId }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_cancelDropOutById",
    buildArguments: (candidacyId) => ({ candidacyId }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_setTypeAccompagnementToAutonome",
    buildArguments: (candidacyId) => ({
      candidacyId,
      reason: faker.lorem.sentence(),
    }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_updateFinanceModule",
    buildArguments: (candidacyId) => ({
      candidacyId,
      financeModule: "unireva",
      reason: faker.lorem.sentence(),
    }),
    enumFields: ["financeModule"],
    returnFields: "{ id }",
  },
];

const unsupportedProfessionalRoles: KeyCloakUserRole[] = [
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

describe("candidacy professional and admin resolver authorization", () => {
  describe("admin-only mutations", () => {
    describe.each(adminOnlyMutationCases)(
      "$endpoint",
      (mutationCase: MutationCase) => {
        const { endpoint, buildArguments, enumFields, returnFields } =
          mutationCase;

        test.each<KeyCloakUserRole>([
          "candidate",
          "manage_candidacy",
          "gestion_maison_mere_aap",
          ...unsupportedProfessionalRoles,
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          const response = await mutation({
            endpoint,
            authorization: asRole(role),
            arguments: buildArguments(faker.string.uuid()),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          const response = await mutation({
            endpoint,
            arguments: buildArguments(faker.string.uuid()),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
        });
      },
    );

    test("allows an admin to validate a candidacy dropout", async () => {
      const dropOut = await createCandidacyDropOutHelper();

      const response = await mutation({
        endpoint: "candidacy_validateDropOut",
        authorization: asRole("admin"),
        arguments: { candidacyId: dropOut.candidacyId },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      const updatedDropOut =
        await prismaClient.candidacyDropOut.findUniqueOrThrow({
          where: { candidacyId: dropOut.candidacyId },
        });
      expect(updatedDropOut.proofReceivedByAdmin).toBe(true);
    });

    test("allows an admin to cancel a candidacy dropout", async () => {
      const dropOut = await createCandidacyDropOutHelper();

      const response = await mutation({
        endpoint: "candidacy_cancelDropOutById",
        authorization: asRole("admin"),
        arguments: { candidacyId: dropOut.candidacyId },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        await prismaClient.candidacyDropOut.findUnique({
          where: { candidacyId: dropOut.candidacyId },
        }),
      ).toBeNull();
    });

    test("allows an admin to set a candidacy to autonomous support", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
        candidacyArgs: {
          typeAccompagnement: "ACCOMPAGNE",
          financeModule: "hors_plateforme",
          feasibilityFormat: "UPLOADED_PDF",
        },
      });

      const response = await mutation({
        endpoint: "candidacy_setTypeAccompagnementToAutonome",
        authorization: asRole("admin"),
        arguments: {
          candidacyId: candidacy.id,
          reason: faker.lorem.sentence(),
        },
        returnFields: "{ id typeAccompagnement }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_setTypeAccompagnementToAutonome,
      ).toMatchObject({ id: candidacy.id, typeAccompagnement: "AUTONOME" });
    });

    test("allows an admin to update the candidacy finance module", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await mutation({
        endpoint: "candidacy_updateFinanceModule",
        authorization: asRole("admin"),
        arguments: {
          candidacyId: candidacy.id,
          financeModule: "unireva",
          reason: faker.lorem.sentence(),
        },
        enumFields: ["financeModule"],
        returnFields: "{ id financeModule }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_updateFinanceModule).toMatchObject({
        id: candidacy.id,
        financeModule: "unireva",
      });
    });
  });
});
