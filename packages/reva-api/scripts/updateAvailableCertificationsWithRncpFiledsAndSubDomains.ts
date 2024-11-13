import { prismaClient } from "../prisma/client";

import { updateCertificationWithRncpFiledsAndSubDomains } from "../modules/referential/features/updateCertificationWithRncpFiledsAndSubDomains";

const updateAvailableCertificationsWithRncpFiledsAndSubDomains = async () => {
  const certifications = await prismaClient.certification.findMany({
    where: { status: "AVAILABLE" },
    select: { id: true, rncpId: true },
  });

  for (const { rncpId } of certifications) {
    try {
      await updateCertificationWithRncpFiledsAndSubDomains({
        codeRncp: rncpId,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const main = async () => {
  await updateAvailableCertificationsWithRncpFiledsAndSubDomains();
};

main();
