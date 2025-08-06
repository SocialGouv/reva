import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";

/**
 * Test assignCandidacyToCertificationAuthorityLocalAccounts
 */
test("should only return the certification authority local accounts based on same certification and department", async () => {
  const certification = await createCertificationHelper();

  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });

  // Create certification authority
  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: certification.id },
    },
    certificationAuthorityOnDepartment: {
      create: { departmentId: candidacy.candidate!.departmentId },
    },
  });

  // Create first certification authority local account
  const certificationAuthorityLocalAccountWithCertificationAndDepartment =
    await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
    });

  await linkCertificationAuthorityLocalAccountToCertificationAndDepartment({
    certificationAuthorityLocalAccountId:
      certificationAuthorityLocalAccountWithCertificationAndDepartment.id,
    certificationId: certification.id,
    departmentId: candidacy.candidate!.departmentId,
  });

  // Create second certification authority local account
  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
  });

  // Create feasibility
  await createFeasibilityDematerializedHelper({
    certificationAuthorityId: certificationAuthority.id,
    candidacyId: candidacy.id,
    isActive: true,
  });

  const localAccountsOnCandidacy =
    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.findMany({
      where: { candidacyId: candidacy.id },
    });

  expect(localAccountsOnCandidacy.length).toBe(1);
  expect(localAccountsOnCandidacy[0].certificationAuthorityLocalAccountId).toBe(
    certificationAuthorityLocalAccountWithCertificationAndDepartment.id,
  );
});

const linkCertificationAuthorityLocalAccountToCertificationAndDepartment =
  async (params: {
    certificationAuthorityLocalAccountId: string;
    certificationId: string;
    departmentId: string;
  }) => {
    const {
      certificationAuthorityLocalAccountId,
      certificationId,
      departmentId,
    } = params;

    await prismaClient.certificationAuthorityLocalAccountOnCertification.create(
      {
        data: {
          certificationId,
          certificationAuthorityLocalAccountId,
        },
      },
    );

    await prismaClient.certificationAuthorityLocalAccountOnDepartment.create({
      data: {
        departmentId,
        certificationAuthorityLocalAccountId,
      },
    });
  };
