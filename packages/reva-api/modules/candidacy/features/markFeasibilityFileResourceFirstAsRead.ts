import { prismaClient } from "@/prisma/client";

export const markFeasibilityFileResourceFirstAsRead = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });

  if (!candidacy) {
    throw new Error("Aucune candidature n'a été trouvée");
  }

  const result = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      feasibilityFileResourceFirstReadAt: new Date(),
    },
  });

  return result;
};
