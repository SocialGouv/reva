import { tz } from "@date-fns/tz";
import { AppointmentType, Prisma } from "@prisma/client";
import { startOfToday } from "date-fns";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import {
  AppointmentSortBy,
  AppointmentTemporalStatus,
} from "../appointment.types";

export const getAppointmentsByCandidacyId = async ({
  candidacyId,
  type,
  temporalStatusFilter,
  sortBy = "DATE_DESC",
  offset = 0,
  limit = 10,
}: {
  candidacyId: string;
  type?: AppointmentType;
  temporalStatusFilter?: AppointmentTemporalStatus;
  sortBy?: AppointmentSortBy;
  offset: number;
  limit: number;
}) => {
  const whereClause: Prisma.AppointmentWhereInput = {
    type,
  };

  //As of now, we only consider the date, not the time when determining if an appointment is upcoming or past
  const now = startOfToday({ in: tz("UTC") });

  if (temporalStatusFilter === "UPCOMING") {
    whereClause.date = {
      gte: now,
    };
  }

  if (temporalStatusFilter === "PAST") {
    whereClause.date = {
      lt: now,
    };
  }

  const results = await prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .appointments({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy:
        sortBy === "DATE_ASC"
          ? [
              {
                date: "asc",
              },
              { time: "asc" },
            ]
          : [
              {
                date: "desc",
              },
              { time: "desc" },
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
