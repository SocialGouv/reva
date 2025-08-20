import { logger } from "@/modules/shared/logger";
import { prismaClient } from "@/prisma/client";

interface DropOutCandidaciesParams {
  candidacyIds: string[];
  dropOutReasonId: string;
  otherReasonContent?: string;
  proofReceivedByAdmin?: boolean;
}

export const dropOutCandidacies = async (
  params: DropOutCandidaciesParams,
): Promise<string[]> => {
  if (!params.candidacyIds.length || !params.dropOutReasonId) {
    return [];
  }

  try {
    const candidacies = await prismaClient.candidacy.findMany({
      where: {
        id: { in: params.candidacyIds },
      },
      include: {
        candidacyDropOut: true,
      },
    });

    const candidaciesToDropOut = candidacies.filter(
      (candidacy) => !candidacy.candidacyDropOut,
    );

    if (candidaciesToDropOut.length === 0) {
      return [];
    }

    await prismaClient.candidacyDropOut.createMany({
      data: candidaciesToDropOut.map((candidacy) => ({
        candidacyId: candidacy.id,
        status: candidacy.status,
        dropOutReasonId: params.dropOutReasonId,
        otherReasonContent: params.otherReasonContent || null,
        proofReceivedByAdmin: params.proofReceivedByAdmin || false,
      })),
    });

    return candidaciesToDropOut.map((candidacy) => candidacy.id);
  } catch (e) {
    logger.error(e);
    throw new Error(`error on drop out candidacies: ${(e as Error).message}`);
  }
};
