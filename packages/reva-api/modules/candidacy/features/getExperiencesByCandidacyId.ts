import { prismaClient } from "../../../prisma/client";

export const getExperiencesByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.experience.findMany({
    where: { candidacyId },
    orderBy: { startedAt: "desc" },
  });
