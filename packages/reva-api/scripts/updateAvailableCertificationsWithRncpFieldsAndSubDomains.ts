import { updateCertificationWithRncpFieldsAndSubDomains } from "../modules/referential/features/updateCertificationWithRncpFieldsAndSubDomains";
import { prismaClient } from "../prisma/client";

const updateAvailableCertificationsWithRncpFieldsAndSubDomains = async () => {
  const certifications = await prismaClient.certification.findMany({
    where: { visible: true },
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
