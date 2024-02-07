import { prismaClient } from "../../../prisma/client";

export const getActivejuryByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.jury.findFirst({
    where: { isActive: true, candidacyId },
  });
