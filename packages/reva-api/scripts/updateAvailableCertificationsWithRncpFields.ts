import { prismaClient } from "../prisma/client";

import { updateCertificationWithRncpFields } from "../modules/referential/features/updateCertificationWithRncpFields";

const updateAvailableCertificationsWithRncpFields = async () => {
  const certifications = await prismaClient.certification.findMany({
    where: { visible: true },
    select: { id: true, rncpId: true },
  });

  for (const { rncpId } of certifications) {
    try {
      await updateCertificationWithRncpFields({
        codeRncp: rncpId,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const main = async () => {
  await updateAvailableCertificationsWithRncpFields();
};

main();
