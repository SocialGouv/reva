import { prismaClient } from "@/prisma/client";

export const getFeasibilityHistory = async ({
  feasibilityId,
  candidacyId,
}: {
  feasibilityId: string;
  candidacyId: string;
}) => {
  const feasibilityFormat = await prismaClient.feasibility.findUnique({
    where: {
      id: feasibilityId,
    },
    select: {
      feasibilityFormat: true,
    },
  });

  if (feasibilityFormat?.feasibilityFormat === "UPLOADED_PDF") {
    const relatedFeasibilities = await prismaClient.feasibility.findMany({
      where: {
        candidacyId: candidacyId,
        decision: "INCOMPLETE",
        NOT: { id: feasibilityId },
      },
      orderBy: {
        decisionSentAt: "desc",
      },
    });

    const history = relatedFeasibilities.map((f) => ({
      id: f.id,
      decision: f.decision,
      decisionComment: f.decisionComment,
      decisionSentAt: f.decisionSentAt,
    }));
    return history;
  } else if (feasibilityFormat?.feasibilityFormat === "DEMATERIALIZED") {
    return prismaClient.feasibilityDecision.findMany({
      where: {
        feasibilityId,
      },
      orderBy: {
        decisionSentAt: "desc",
      },
    });
  }
};
