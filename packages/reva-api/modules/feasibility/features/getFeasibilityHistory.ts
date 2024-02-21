import { prismaClient } from "../../../prisma/client";

export const getFeasibilityHistory = async ({
  feasibilityId,
  candidacyId,
}: {
  feasibilityId: string;
  candidacyId: string;
}) => {
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
    decision: f.decision,
    decisionComment: f.decisionComment,
    decisionSentAt: f.decisionSentAt,
  }));

  return history;
};
