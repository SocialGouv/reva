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
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_selectOrganismAsAdmin = graphql(`
  mutation candidacy_selectOrganismAsAdmin_authorization(
    $candidacyId: UUID!
    $organismId: UUID!
  ) {
    candidacy_selectOrganismAsAdmin(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
    }
  }
`);

const candidacy_validateDropOut = graphql(`
  mutation candidacy_validateDropOut_authorization($candidacyId: UUID!) {
    candidacy_validateDropOut(candidacyId: $candidacyId) {
      id
    }
  }
`);

const candidacy_cancelDropOutById = graphql(`
  mutation candidacy_cancelDropOutById_authorization($candidacyId: UUID!) {
    candidacy_cancelDropOutById(candidacyId: $candidacyId) {
      id
    }
  }
`);

const candidacy_setTypeAccompagnementToAutonome = graphql(`
  mutation candidacy_setTypeAccompagnementToAutonome_authorization(
    $candidacyId: UUID!
    $reason: String
  ) {
    candidacy_setTypeAccompagnementToAutonome(
      candidacyId: $candidacyId
      reason: $reason
    ) {
      id
      typeAccompagnement
    }
  }
`);

const candidacy_updateFinanceModule = graphql(`
  mutation candidacy_updateFinanceModule_authorization(
    $candidacyId: UUID!
    $financeModule: FinanceModule!
    $reason: String
  ) {
    candidacy_updateFinanceModule(
      candidacyId: $candidacyId
      financeModule: $financeModule
      reason: $reason
    ) {
      id
      financeModule
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const getClient = (authorization?: string) =>
  getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

const selectOrganismAsAdmin = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_selectOrganismAsAdmin, {
    candidacyId,
    organismId: faker.string.uuid(),
  });

const validateDropOut = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_validateDropOut, { candidacyId });

const cancelDropOutById = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_cancelDropOutById, {
    candidacyId,
  });

const setTypeAccompagnementToAutonome = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_setTypeAccompagnementToAutonome, {
    candidacyId,
    reason: faker.lorem.sentence(),
  });

const updateFinanceModule = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_updateFinanceModule, {
    candidacyId,
    financeModule: "unireva",
    reason: faker.lorem.sentence(),
  });

interface MutationCase {
  operationName: string;
  request: (
    authorization: string | undefined,
    candidacyId: string,
  ) => Promise<unknown>;
}

const adminOnlyMutationCases: MutationCase[] = [
  {
    operationName: "candidacy_selectOrganismAsAdmin",
    request: selectOrganismAsAdmin,
  },
  {
    operationName: "candidacy_validateDropOut",
    request: validateDropOut,
  },
  {
    operationName: "candidacy_cancelDropOutById",
    request: cancelDropOutById,
  },
  {
    operationName: "candidacy_setTypeAccompagnementToAutonome",
    request: setTypeAccompagnementToAutonome,
  },
  {
    operationName: "candidacy_updateFinanceModule",
    request: updateFinanceModule,
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
      "$operationName",
      (mutationCase: MutationCase) => {
        const { request } = mutationCase;

        test.each<KeyCloakUserRole>([
          "candidate",
          "manage_candidacy",
          "gestion_maison_mere_aap",
          ...unsupportedProfessionalRoles,
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          await expect(
            request(asRole(role), faker.string.uuid()),
          ).rejects.toThrowError(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          await expect(
            request(undefined, faker.string.uuid()),
          ).rejects.toThrowError(SESSION_EXPIRED);
        });
      },
    );

    test("allows an admin to validate a candidacy dropout", async () => {
      const dropOut = await createCandidacyDropOutHelper();

      await validateDropOut(asRole("admin"), dropOut.candidacyId);

      const updatedDropOut =
        await prismaClient.candidacyDropOut.findUniqueOrThrow({
          where: { candidacyId: dropOut.candidacyId },
        });
      expect(updatedDropOut.proofReceivedByAdmin).toBe(true);
    });

    test("allows an admin to cancel a candidacy dropout", async () => {
      const dropOut = await createCandidacyDropOutHelper();

      await cancelDropOutById(asRole("admin"), dropOut.candidacyId);

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

      const response = await setTypeAccompagnementToAutonome(
        asRole("admin"),
        candidacy.id,
      );

      expect(response.candidacy_setTypeAccompagnementToAutonome).toMatchObject({
        id: candidacy.id,
        typeAccompagnement: "AUTONOME",
      });
    });

    test("allows an admin to update the candidacy finance module", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await updateFinanceModule(asRole("admin"), candidacy.id);

      expect(response.candidacy_updateFinanceModule).toMatchObject({
        id: candidacy.id,
        financeModule: "unireva",
      });
    });
  });
});
