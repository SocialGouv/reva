import { prismaClient } from "../../../prisma/client";

export const getCompetenceBlocsByCertificationIdV2 = async ({
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
