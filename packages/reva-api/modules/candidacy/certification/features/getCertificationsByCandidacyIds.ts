import { prismaClient } from "../../../../prisma/client";

export const getCertificationsByCandidacyIds = ({
  candidacyIds,
}: {
  candidacyIds: string[];
}) =>
  prismaClient.certification.findMany({
    where: {
      candidaciesAndRegions: {
        some: {
          candidacyId: { in: candidacyIds },
          isActive: true,
        },
      },
    },
    include: { candidaciesAndRegions: { where: { isActive: true } } }, //include candidaciesAndRegions because this method is used in a graphql loader an we need access to the candidacy id in the result
  });
