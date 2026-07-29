import { faker } from "@faker-js/faker";

import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";

import { transferCandidacyToAnotherCertificationAuthority } from "./transferCandidacyToAnotherCertificationAuthority";

describe("transferCandidacyToAnotherCertificationAuthority", () => {
  test("should update the candidacy certification authority to the new certification authority", async () => {
    const previousCertificationAuthority =
      await createCertificationAuthorityHelper();
    const feasibility = await createFeasibilityUploadedPdfHelper({
      certificationAuthorityId: previousCertificationAuthority.id,
      isActive: true,
    });
    await prismaClient.candidacy.update({
      where: { id: feasibility.candidacyId },
      data: { certificationAuthorityId: previousCertificationAuthority.id },
    });

    const newCertificationAuthority =
      await createCertificationAuthorityHelper();

    await transferCandidacyToAnotherCertificationAuthority({
      candidacyId: feasibility.candidacyId,
      certificationAuthorityId: newCertificationAuthority.id,
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
