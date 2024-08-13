import { prismaClient } from "../../../../prisma/client";

export const getCertificationByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  candidacyId
    ? prismaClient.candidacy
        .findUnique({ where: { id: candidacyId } })
        .certification()
    : null;
