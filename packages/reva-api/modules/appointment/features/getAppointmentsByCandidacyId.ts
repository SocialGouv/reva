import { prismaClient } from "@/prisma/client";

export const getAppointmentsByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .appointments();
