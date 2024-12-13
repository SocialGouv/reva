import { prismaClient } from "../prisma/client";

import { updateCertificationWithPrerequisitesFromFC } from "../modules/referential/features/updateCertificationWithPrerequisitesFromFC";

const updateAllCertificationsWithPrerequisitesFromFC = async () => {
  const certifications = await prismaClient.certification.findMany({
    select: { id: true, rncpId: true },
  });

  for (const { rncpId } of certifications) {
    try {
      console.log("Processing certification with rncpId", rncpId);
      await updateCertificationWithPrerequisitesFromFC({
        codeRncp: rncpId,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const main = async () => {
  await updateAllCertificationsWithPrerequisitesFromFC();
};

main();
