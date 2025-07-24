import { prismaClient } from "@/prisma/client";

export const updateFeasibilityFileTemplateFirstReadAt = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });

  if (!candidacy) {
    throw new Error("Candidacy not found");
  }

  //Only update if the field is not already set
  if (candidacy.feasibilityFileTemplateFirstReadAt) {
    return candidacy;
  } else {
    return prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: { feasibilityFileTemplateFirstReadAt: new Date() },
    });
  }
};
