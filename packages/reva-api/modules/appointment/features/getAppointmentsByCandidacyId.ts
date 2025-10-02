import { AppointmentType, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getAppointmentsByCandidacyId = async ({
  candidacyId,
  type,
  onlyNext = false,
  offset = 0,
  limit = 10,
}: {
  candidacyId: string;
  type: AppointmentType;
  onlyNext?: boolean;
  offset: number;
  limit: number;
}) => {
  const whereClause: Prisma.AppointmentWhereInput = {
    type,
  };
  if (onlyNext) {
    whereClause.date = {
      gte: new Date(),
    };
    whereClause.OR = [
      {
        time: null,
      },
      {
        time: {
          gte: new Date(),
        },
      },
    ];
  }

  const results = await prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .appointments({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: [
        {
          date: "asc",
        },
        { time: "asc" },
      ],
    });

  const count = await prismaClient.appointment.count({
    where: { candidacyId, ...whereClause },
  });

  return {
    rows: results,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
