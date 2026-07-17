import { AUCUNE_CANDIDATURE_ETE_TROUVEE } from "@/modules/shared/errors/messages";
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
    throw new Error(AUCUNE_CANDIDATURE_ETE_TROUVEE);
  }

  const result = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      feasibilityFileResourceFirstReadAt: new Date(),
    },
  });

  return result;
};
