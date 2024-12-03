/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { faker } from "@faker-js/faker/.";
import { prismaClient } from "../../../../prisma/client";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../../../test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";

const getActiveFeasibilityByCandidacyId = async ({
  candidacyId,
  keycloakId,
}: {
  candidacyId: string;
  keycloakId: string;
}) =>
  injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibility_getActiveFeasibilityByCandidacyId",
      arguments: { candidacyId },
      returnFields: "{id}",
    },
  });

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Vous n'êtes pas autorisé à gérer cette candidature.",
  CANDIDACY_NOT_FOUND: "Candidature inexistante.",
} as const;

describe("isFeasibilityManager", () => {
  describe("manage_feasibility role", () => {
    test("should allow access when user manages the certification authority of the feasibility", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority =
        certification.certificationAuthorityStructure
          ?.oldCertificationAuthorities[0];
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      if (
        !certificationAuthority?.id ||
        !certificationAuthority.Account[0].id ||
        !candidacy.departmentId
      ) {
        throw new Error("Required IDs are undefined");
      }

      await prismaClient.certificationAuthorityLocalAccount.create({
        data: {
          certificationAuthorityId: certificationAuthority.id,
          accountId: certificationAuthority.Account[0].id,
          certificationAuthorityLocalAccountOnCertification: {
            create: {
              certificationId: certification.id,
            },
          },
          certificationAuthorityLocalAccountOnDepartment: {
            create: {
              departmentId: candidacy.departmentId,
            },
          },
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId: certificationAuthority?.id,
        candidacyId: candidacy.id,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId: certificationAuthority?.Account[0].keycloakId,
      });

      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("should deny access when user does not manage the certification authority", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when feasibility does not exist", async () => {
      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: faker.string.uuid(),
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(
        ERROR_MESSAGES.CANDIDACY_NOT_FOUND,
      );
    });

    test("should deny access when account is not found", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when feasibility is not active", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority =
        certification.certificationAuthorityStructure
          ?.oldCertificationAuthorities[0];
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId: certificationAuthority?.id,
        candidacyId: candidacy.id,
        isActive: false,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId:
          certificationAuthority?.Account[0].keycloakId ?? faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(
        ERROR_MESSAGES.CANDIDACY_NOT_FOUND,
      );
    });
  });

  describe("manage_feasibility role with certification and department checks", () => {
    test("should allow access when user matches certification, authority and department", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority =
        certification.certificationAuthorityStructure
          ?.oldCertificationAuthorities[0];
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      if (
        !certificationAuthority?.id ||
        !certificationAuthority.Account[0].id ||
        !candidacy.departmentId
      ) {
        throw new Error("Required IDs are undefined");
      }

      await prismaClient.certificationAuthorityLocalAccount.create({
        data: {
          certificationAuthorityId: certificationAuthority.id,
          accountId: certificationAuthority.Account[0].id,
          certificationAuthorityLocalAccountOnCertification: {
            create: {
              certificationId: certification.id,
            },
          },
          certificationAuthorityLocalAccountOnDepartment: {
            create: {
              departmentId: candidacy.departmentId,
            },
          },
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId: certificationAuthority?.id,
        candidacyId: candidacy.id,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId: certificationAuthority?.Account[0].keycloakId,
      });

      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("should deny access when certification does not match", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();
      const differentCertification = await createCertificationHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId:
          differentCertification.certificationAuthorityStructure
            ?.oldCertificationAuthorities[0].Account[0].keycloakId ??
          faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when department does not match", async () => {
      const department = await prismaClient.department.create({
        data: {
          code: faker.string.numeric(3),
          label: faker.lorem.sentence(),
          region: {
            create: {
              code: faker.string.numeric(3),
              label: faker.lorem.sentence(),
            },
          },
        },
      });
      const differentDepartmentCandidacy = await createCandidacyHelper({
        candidacyArgs: {
          departmentId: department.id,
        },
      });
      await createFeasibilityUploadedPdfHelper({
        candidacyId: differentDepartmentCandidacy.id,
      });

      const certificationAuthority = await createCertificationHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: differentDepartmentCandidacy.id,
        keycloakId:
          certificationAuthority.certificationAuthorityStructure
            ?.oldCertificationAuthorities[0].Account[0].keycloakId ??
          faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when certification authority does not match", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();
      const differentAuthority = await createCertificationHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId:
          differentAuthority.certificationAuthorityStructure
            ?.oldCertificationAuthorities[0].Account[0].keycloakId ??
          faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when feasibility is not active", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority =
        certification.certificationAuthorityStructure
          ?.oldCertificationAuthorities[0];
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId: certificationAuthority?.id,
        candidacyId: candidacy.id,
        isActive: false,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId:
          certificationAuthority?.Account[0].keycloakId ?? faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(
        ERROR_MESSAGES.CANDIDACY_NOT_FOUND,
      );
    });

    test("should deny access when only certification authority matches", async () => {
      const certification = await createCertificationHelper();
      const differentCertification = await createCertificationHelper();
      const differentDepartment = await prismaClient.department.create({
        data: {
          code: faker.string.numeric(3),
          label: faker.lorem.sentence(),
          region: {
            create: {
              code: faker.string.numeric(3),
              label: faker.lorem.sentence(),
            },
          },
        },
      });

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: differentCertification.id,
          departmentId: differentDepartment.id,
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId:
          certification.certificationAuthorityStructure
            ?.oldCertificationAuthorities[0].id,
        candidacyId: candidacy.id,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId:
          certification.certificationAuthorityStructure
            ?.oldCertificationAuthorities[0].Account[0].keycloakId ??
          faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });
  });

  describe("other roles", () => {
    test("should deny access for unauthorized roles", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });
  });
});
