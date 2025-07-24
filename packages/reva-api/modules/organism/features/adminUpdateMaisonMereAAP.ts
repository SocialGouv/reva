import { StatutValidationInformationsJuridiquesMaisonMereAAP } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { deleteOldMaisonMereAAPLegalInformationDocuments } from "./deleteOldMaisonMereAAPLegalInformationDocuments";

export const adminUpdateLegalInformationValidationStatus = async (params: {
  maisonMereAAPId: string;
  maisonMereAAPData: {
    statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAAP;
    internalComment?: string;
    aapComment?: string;
  };
}) => {
  const { maisonMereAAPId } = params;

  try {
    const maisonMereAAPLegalInformationDocuments =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId },
        select: {
          managerFirstname: true,
          managerLastname: true,
        },
      });

    let maisonMereAAPData: (typeof params)["maisonMereAAPData"] & {
      managerFirstname?: string;
      managerLastname?: string;
    } = { ...params.maisonMereAAPData };

    if (
      maisonMereAAPData.statutValidationInformationsJuridiquesMaisonMereAAP ===
      "A_JOUR"
    ) {
      maisonMereAAPData = {
        ...maisonMereAAPData,
        managerFirstname:
          maisonMereAAPLegalInformationDocuments?.managerFirstname,
        managerLastname:
          maisonMereAAPLegalInformationDocuments?.managerLastname,
      };
    }

    const maisonMereAAP = await prismaClient.maisonMereAAP.update({
      where: { id: maisonMereAAPId },
      data: maisonMereAAPData,
      include: {
        gestionnaire: true,
      },
    });

    if (
      maisonMereAAPData.statutValidationInformationsJuridiquesMaisonMereAAP ===
      "A_JOUR"
    ) {
      await deleteOldMaisonMereAAPLegalInformationDocuments({
        maisonMereAAPId,
      });
    }
    return maisonMereAAP;
  } catch (e) {
    throw new Error(
      `Impossible de modifier le statut de validation des documents légaux: ${e}.`,
    );
  }
};
