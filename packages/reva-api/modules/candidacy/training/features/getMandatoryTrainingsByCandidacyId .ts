import { prismaClient } from "../../../../prisma/client";
export const getMandatoryTrainingsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.training.findMany({
    where: {
      candidacies: {
        some: {
          candidacyId: candidacyId,
        },
      },
    },
  });
