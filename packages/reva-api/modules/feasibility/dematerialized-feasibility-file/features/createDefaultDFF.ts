import { prismaClient } from "@/prisma/client";

export const createDFFIfNotExistsByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, feasibilityFormat: "DEMATERIALIZED", isActive: true },
    include: {
      dematerializedFeasibilityFile: true,
    },
  });

  // If no feasibility exists, create a new one
  if (!feasibility) {
    await prismaClient.feasibility.create({
      data: {
        candidacyId,
        feasibilityFormat: "DEMATERIALIZED",
        isActive: true,
        dematerializedFeasibilityFile: {
          create: {},
        },
      },
    });
  }

  // If the feasibility exists but no DFF exists, create a new one
  if (feasibility && !feasibility.dematerializedFeasibilityFile) {
    await prismaClient.feasibility.update({
      where: { id: feasibility.id },
      data: {
        dematerializedFeasibilityFile: { create: {} },
      },
    });
  }
};
