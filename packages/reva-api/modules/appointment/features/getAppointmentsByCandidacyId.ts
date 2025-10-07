import { AppointmentType, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { AppointmentTemporalStatus } from "../appointment.types";

export const getAppointmentsByCandidacyId = async ({
  candidacyId,
  type,
  temporalStatusFilter,
  offset = 0,
  limit = 10,
}: {
  candidacyId: string;
  type: AppointmentType;
  temporalStatusFilter?: AppointmentTemporalStatus;
  offset: number;
  limit: number;
}) => {
  const whereClause: Prisma.AppointmentWhereInput = {
    type,
  };
  if (temporalStatusFilter === "UPCOMING") {
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
