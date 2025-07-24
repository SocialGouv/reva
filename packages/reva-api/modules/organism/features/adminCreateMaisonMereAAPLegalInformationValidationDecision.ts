import { prismaClient } from "@/prisma/client";

import { LegalInformationValidationDecisionInput } from "../organism.types";

export const adminCreateMaisonMereAAPLegalInformationValidationDecision =
  async (
    maisonMereAAPId: string,
    data: LegalInformationValidationDecisionInput,
  ) => {
    const r =
      await prismaClient.maisonMereAAPLegalInformationDocumentsDecision.create({
        data: {
          ...data,
          maisonMereAAPId,
        },
      });
    return r;
  };
