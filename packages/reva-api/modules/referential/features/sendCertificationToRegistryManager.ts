import { prismaClient } from "@/prisma/client";

import { sendNewCertificationAvailableToCertificationRegistryManagerEmail } from "../emails/sendNewCertificationAvailableToCertificationRegistryManagerEmail";
import { SendCertificationToRegistryManagerInput } from "../referential.types";

export const sendCertificationToRegistryManager = async ({
  certificationId,
}: SendCertificationToRegistryManagerInput) => {
  const certification = await prismaClient.certification.findUnique({
    where: {
      id: certificationId,
    },
    include: {
      competenceBlocs: true,
      certificationAuthorityStructure: {
        include: {
          certificationRegistryManager: { include: { account: true } },
        },
      },
    },
  });

  if (!certification) {
    throw new Error("La certification n'existe pas");
  }

  if (!certification.certificationAuthorityStructure) {
    throw new Error(
      "La certification doit être rattachée à une structure certificatrice",
    );
  }

  if (certification.status != "BROUILLON") {
    throw new Error(
      "Le statut de la certification doit être à l'état 'Brouillon'",
    );
  }

  const updatedCertification = await prismaClient.certification.update({
    where: { id: certification.id },
    data: {
      status: "A_VALIDER_PAR_CERTIFICATEUR",
      certificationStatusHistory: {
        create: { status: "A_VALIDER_PAR_CERTIFICATEUR" },
      },
    },
  });

  const certificationRegistryManagerEmail =
    certification.certificationAuthorityStructure.certificationRegistryManager
      ?.account?.email;

  if (certificationRegistryManagerEmail) {
    await sendNewCertificationAvailableToCertificationRegistryManagerEmail({
      email: certificationRegistryManagerEmail,
    });
  }

  return updatedCertification;
};
