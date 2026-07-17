import { STATUT_CERTIFICATION_DOIT_ETRE_ETAT_BROUILLON } from "@/modules/shared/errors/messages";
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
    throw new Error(STATUT_CERTIFICATION_DOIT_ETRE_ETAT_BROUILLON);
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
