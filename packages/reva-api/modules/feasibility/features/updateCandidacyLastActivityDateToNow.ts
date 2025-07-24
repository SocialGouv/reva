import { prismaClient } from "@/prisma/client";

export const updateCandidacyLastActivityDateToNow = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { lastActivityDate: new Date() },
  });
