import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "../../../test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "../../../test/helpers/entities/create-certification-helper";
import { createCohorteVaeCollectiveHelper } from "../../../test/helpers/entities/create-vae-collective-helper";
import { createCertificationAuthorityLocalAccountHelper } from "../../../test/helpers/entities/create-certification-authority-local-account-helper";
import { createFeasibilityDematerializedHelper } from "../../../test/helpers/entities/create-feasibility-dematerialized-helper";

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

describe("VAE collective", () => {
  /**
   * Test assignCandidacyToCertificationAuthorityLocalAccounts restricted by a VAE collective cohort
   */
  test("should only return the certification authority local accounts available for the VAE collective cohort", async () => {
    const certificationVaeCollective = await createCertificationHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: { certificationId: certificationVaeCollective.id },
      },
    });

    const candidacy = await createCandidacyHelper({
      candidacyArgs: {
        cohorteVaeCollectiveId: cohorteVaeCollective.id,
        certificationId: certificationVaeCollective.id,
      },
    });

    // Create certification authority
    const certificationAuthority = await createCertificationAuthorityHelper({
      certificationAuthorityOnCertification: {
        create: { certificationId: certificationVaeCollective.id },
      },
      certificationAuthorityOnDepartment: {
        create: { departmentId: candidacy.candidate!.departmentId },
      },
    });

    // Restrict certification to first certification authority
    const restrictedCertificationAuthority =
      await prismaClient.certificationCohorteVaeCollectiveOnCertificationAuthority.create(
        {
          data: {
            certificationAuthorityId: certificationAuthority.id,
            certificationCohorteVaeCollectiveId:
              cohorteVaeCollective.certificationCohorteVaeCollectives[0].id,
          },
        },
      );

    // Create first certification authority local account
    const certificationAuthorityLocalAccount1 =
      await createCertificationAuthorityLocalAccountHelper({
        certificationAuthorityId: certificationAuthority.id,
      });

    await linkCertificationAuthorityLocalAccountToCertificationAndDepartment({
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount1.id,
      certificationId: certificationVaeCollective.id,
      departmentId: candidacy.candidate!.departmentId,
    });

    // Restrict certification to first certification authority local account of restrictedCertificationAuthority
    await prismaClient.certificationCohorteVaeCollectiveOnCertificationAuthorityOnCertificationAuthorityLocalAccount.create(
      {
        data: {
          certificationAuthorityLocalAccountId:
            certificationAuthorityLocalAccount1.id,
          certificationCohorteVaeCollectiveOnCertificationAuthorityId:
            restrictedCertificationAuthority.id,
        },
      },
    );

    // Create second certification authority local account
    const certificationAuthorityLocalAccount2 =
      await createCertificationAuthorityLocalAccountHelper({
        certificationAuthorityId: certificationAuthority.id,
      });

    await linkCertificationAuthorityLocalAccountToCertificationAndDepartment({
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount2.id,
      certificationId: certificationVaeCollective.id,
      departmentId: candidacy.candidate!.departmentId,
    });

    // Crate feasibility
    await createFeasibilityDematerializedHelper({
      certificationAuthorityId: certificationAuthority.id,
      candidacyId: candidacy.id,
      isActive: true,
    });

    const localAccountsOnCandidacy =
      await prismaClient.certificationAuthorityLocalAccountOnCandidacy.findMany(
        {
          where: { candidacyId: candidacy.id },
        },
      );

    expect(localAccountsOnCandidacy.length).toBe(1);
    expect(
      localAccountsOnCandidacy[0].certificationAuthorityLocalAccountId,
    ).toBe(certificationAuthorityLocalAccount1.id);
  });
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
