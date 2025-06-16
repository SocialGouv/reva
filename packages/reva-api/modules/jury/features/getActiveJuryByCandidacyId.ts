import { prismaClient } from "../../../prisma/client";

export const getActivejuryByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  //Prisma graphql optimization. We start with the candidacy since we can use a unique index
  //It allows prisma to automatically batch the queries in the case of a n+1 graphql query (all the active jurys of many candidacies)
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      Jury: {
        where: { isActive: true },
      },
    },
  });

  const activeJury = candidacy?.Jury[0];

  return activeJury;
};
