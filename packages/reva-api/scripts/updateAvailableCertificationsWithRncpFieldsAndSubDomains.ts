import { prismaClient } from "../prisma/client";

import { updateCertificationWithRncpFieldsAndSubDomains } from "../modules/referential/features/updateCertificationWithRncpFieldsAndSubDomains";

const updateAvailableCertificationsWithRncpFieldsAndSubDomains = async () => {
  const certifications = await prismaClient.certification.findMany({
    where: { status: "AVAILABLE" },
    select: { id: true, rncpId: true },
  });

  for (const { rncpId } of certifications) {
    try {
      await updateCertificationWithRncpFieldsAndSubDomains({
        codeRncp: rncpId,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const main = async () => {
  await updateAvailableCertificationsWithRncpFieldsAndSubDomains();
};

main();
