import { MaisonMereAAPLegalInformationDocumentsDecisionEnum } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPLegalInformationDocumentsDecisionsByMaisonMereAAPIdAndDecision =
  ({
    maisonMereAAPId,
    decision,
  }: {
    maisonMereAAPId: string;
    decision?: MaisonMereAAPLegalInformationDocumentsDecisionEnum;
  }) =>
    prismaClient.maisonMereAAPLegalInformationDocumentsDecision.findMany({
      where: { maisonMereAAPId, decision },
      orderBy: { decisionTakenAt: "desc" },
    });
