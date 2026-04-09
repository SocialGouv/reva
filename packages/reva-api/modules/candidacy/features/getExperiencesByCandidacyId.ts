import { prismaClient } from "@/prisma/client";

export const getExperiencesByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({
      where: { id: candidacyId },
    })
    .experiences({ orderBy: { startedAt: "desc" } });
