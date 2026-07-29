import { faker } from "@faker-js/faker";

import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";

import { transferCandidacyToCertificationAuthorityLocalAccount } from "./transferCandidacyToCertificationAuthorityLocalAccount";

const createAuthorityOnStructure = (
  certificationAuthorityStructureId: string,
) =>
  createCertificationAuthorityHelper({
    certificationAuthorityOnCertificationAuthorityStructure: {
      create: { certificationAuthorityStructureId },
    },
  });

describe("transferCandidacyToCertificationAuthorityLocalAccount", () => {
  test("should update the candidacy certification authority to the local account's certification authority", async () => {
    const structure = await createCertificationAuthorityStructureHelper();
    const previousCertificationAuthority = await createAuthorityOnStructure(
      structure.id,
    );
    const newCertificationAuthority = await createAuthorityOnStructure(
      structure.id,
    );

    const feasibility = await createFeasibilityUploadedPdfHelper({
      certificationAuthorityId: previousCertificationAuthority.id,
      isActive: true,
    });
    await prismaClient.candidacy.update({
      where: { id: feasibility.candidacyId },
      data: { certificationAuthorityId: previousCertificationAuthority.id },
    });

    const localAccount = await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: newCertificationAuthority.id,
    });

    await transferCandidacyToCertificationAuthorityLocalAccount({
      candidacyId: feasibility.candidacyId,
      certificationAuthorityLocalAccountId: localAccount.id,
      transferReason: "Changement de périmètre géographique",
      userInfo: {
        userRoles: ["admin"],
        userKeycloakId: faker.string.uuid(),
        userEmail: faker.internet.email(),
      },
    });

    const updatedCandidacy = await prismaClient.candidacy.findUnique({
      where: { id: feasibility.candidacyId },
    });
    expect(updatedCandidacy?.certificationAuthorityId).toEqual(
      newCertificationAuthority.id,
    );

    const updatedFeasibility = await prismaClient.feasibility.findUnique({
      where: { id: feasibility.id },
    });
    expect(updatedFeasibility?.certificationAuthorityId).toEqual(
      newCertificationAuthority.id,
    );
  });
});
