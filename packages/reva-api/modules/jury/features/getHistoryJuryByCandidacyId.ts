import { prismaClient } from "@/prisma/client";

export const getHistoryJuryByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.jury.findMany({
    where: { candidacyId, isActive: false, result: { not: null } },
  });
