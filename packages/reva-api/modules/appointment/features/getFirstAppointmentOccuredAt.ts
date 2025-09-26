import { prismaClient } from "@/prisma/client";

export const getFirstAppointmentOccuredAt = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .appointments({
      orderBy: { date: "asc" },
      take: 1,
    })
    .then((appointments) => appointments?.[0]?.date);
