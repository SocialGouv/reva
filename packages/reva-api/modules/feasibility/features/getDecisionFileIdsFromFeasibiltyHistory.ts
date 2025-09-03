import { prismaClient } from "@/prisma/client";

export const getDecisionFileIdsFromFeasibiltyHistory = async ({
  feasibilityId,
}: {
  feasibilityId: string;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: {
      id: feasibilityId,
    },
    select: {
      candidacyId: true,
      feasibilityFormat: true,
    },
  });

  if (!feasibility) {
    return;
  }

  if (feasibility?.feasibilityFormat === "UPLOADED_PDF") {
    const relatedFeasibilities = await prismaClient.feasibility.findMany({
      where: {
        candidacyId: feasibility.candidacyId,
        decision: "INCOMPLETE",
        NOT: { id: feasibilityId },
      },
      orderBy: {
        decisionSentAt: "desc",
      },
    });

    const historyWithDecisonFileIds = relatedFeasibilities
      .map(({ decisionFileId }) => decisionFileId)
      .filter((v) => typeof v == "string");

    return historyWithDecisonFileIds;
  } else if (feasibility?.feasibilityFormat === "DEMATERIALIZED") {
    const history = await prismaClient.feasibilityDecision.findMany({
      where: {
        feasibilityId,
      },
      orderBy: {
        decisionSentAt: "desc",
      },
    });

    const historyWithDecisonFileIds = history
      .map(({ decisionFileId }) => decisionFileId)
      .filter((v) => typeof v == "string");

    return historyWithDecisonFileIds;
  }
};
