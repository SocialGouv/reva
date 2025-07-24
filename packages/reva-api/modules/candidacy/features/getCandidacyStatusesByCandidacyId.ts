import { prismaClient } from "@/prisma/client";

export const getCandidacyStatusesByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .candidacyStatuses();
