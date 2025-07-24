import { prismaClient } from "@/prisma/client";

export const getCompetenceBlocsByCertificationId = async ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certificationCompetenceBloc.findMany({
    where: {
      certificationId,
    },
    orderBy: [{ code: "asc" }, { label: "asc" }],
  });
