import { prismaClient } from "../../../prisma/client";

export const getOrganismByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: { organism: true },
  });
