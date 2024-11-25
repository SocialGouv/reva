import { prismaClient } from "../../../prisma/client";
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
      certificationAuthorityStructure: true,
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

  if (certification.statusV2 != "BROUILLON") {
    throw new Error(
      "Le statut de la certification doit être à l'état 'Brouillon'",
    );
  }

  const updatedCertification = await prismaClient.certification.update({
    where: { id: certification.id },
    data: { statusV2: "A_VALIDER_PAR_CERTIFICATEUR" },
  });

  return updatedCertification;
};
