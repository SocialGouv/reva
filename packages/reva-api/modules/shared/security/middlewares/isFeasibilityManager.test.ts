import { faker } from "@faker-js/faker";

import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const getActiveFeasibilityByCandidacyId = async ({
  candidacyId,
  keycloakId,
}: {
  candidacyId: string;
  keycloakId: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
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
    test("should allow access when user manages the feasibility", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority = await createCertificationAuthorityHelper();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      if (
        !certificationAuthority?.id ||
        !certificationAuthority.Account[0].id ||
        !candidacy.candidate?.departmentId
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
              departmentId: candidacy.candidate.departmentId,
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

    test("should deny access when user doesn't manage the feasibility", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when candidacy does not exist", async () => {
      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: faker.string.uuid(),
        keycloakId: faker.string.uuid(),
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(
        ERROR_MESSAGES.CANDIDACY_NOT_FOUND,
      );
    });

    test("should deny access when feasibility file does not exist", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority = await createCertificationAuthorityHelper();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      if (!candidacy.candidate?.departmentId) {
        throw new Error("Candidate department ID is undefined");
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
              departmentId: candidacy.candidate.departmentId,
            },
          },
        },
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId: certificationAuthority?.Account[0].keycloakId,
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
      const certificationAuthority = await createCertificationAuthorityHelper();
      const candidacy = await createCandidacyHelper();

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
    test("should allow access when user matches certification and department", async () => {
      const certification = await createCertificationHelper();
      const certificationAuthority = await createCertificationAuthorityHelper();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
      });

      if (
        !certificationAuthority?.id ||
        !certificationAuthority.Account[0].id ||
        !candidacy.candidate?.departmentId
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
              departmentId: candidacy.candidate.departmentId,
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

    test("should deny access when certification authority does not match", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper();
      const certificationAuthority = await createCertificationAuthorityHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: feasibility.candidacyId,
        keycloakId: certificationAuthority.Account[0].keycloakId,
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when department does not match", async () => {
      const department = await prismaClient.department.create({
        data: {
          code: faker.string.numeric(3),
          label: faker.lorem.sentence(),
          timezone: faker.location.timeZone(),
          elligibleVAE: true,
          region: {
            create: {
              code: faker.string.numeric(3),
              label: faker.lorem.sentence(),
            },
          },
        },
      });

      const differentDepartmentCandidate = await createCandidateHelper({
        departmentId: department.id,
      });

      const differentDepartmentCandidacy = await createCandidacyHelper({
        candidacyArgs: {
          candidateId: differentDepartmentCandidate.id,
        },
      });

      await createFeasibilityUploadedPdfHelper({
        candidacyId: differentDepartmentCandidacy.id,
      });

      const certificationAuthority = await createCertificationAuthorityHelper();

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: differentDepartmentCandidacy.id,
        keycloakId: certificationAuthority.Account[0].keycloakId,
      });

      expect(resp.json()).toHaveProperty("errors");
      expect(resp.json().errors[0].message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test("should deny access when feasibility is not active", async () => {
      const certificationAuthority = await createCertificationAuthorityHelper();
      const candidacy = await createCandidacyHelper();

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
      const certificationAuthority = await createCertificationAuthorityHelper();
      const differentDepartment = await prismaClient.department.create({
        data: {
          code: faker.string.numeric(3),
          label: faker.lorem.sentence(),
          timezone: faker.location.timeZone(),
          elligibleVAE: true,
          region: {
            create: {
              code: faker.string.numeric(3),
              label: faker.lorem.sentence(),
            },
          },
        },
      });

      const candidate = await createCandidateHelper({
        departmentId: differentDepartment.id,
      });

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          candidateId: candidate.id,
        },
      });

      await createFeasibilityUploadedPdfHelper({
        certificationAuthorityId: certificationAuthority.id,
        candidacyId: candidacy.id,
      });

      const resp = await getActiveFeasibilityByCandidacyId({
        candidacyId: candidacy.id,
        keycloakId: certificationAuthority.Account[0].keycloakId,
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
