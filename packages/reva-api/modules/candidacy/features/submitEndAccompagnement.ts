import { prismaClient } from "@/prisma/client";

import { getCandidacyById } from "./getCandidacyById";

export const submitEndAccompagnement = async ({
  candidacyId,
  endAccompagnementDate,
}: {
  candidacyId: string;
  endAccompagnementDate: Date;
}) => {
  const candidacy = await getCandidacyById({ candidacyId });
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const updatedCandidacy = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      endAccompagnementDate,
      endAccompagnementStatus: "PENDING",
    },
  });

  return updatedCandidacy;
};
