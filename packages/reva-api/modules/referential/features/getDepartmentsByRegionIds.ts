import { prismaClient } from "../../../prisma/client";

export const getDepartmentsByRegionIds = ({
  regionIds,
}: {
  regionIds: string[];
}) =>
  prismaClient.department.findMany({
    where: { regionId: { in: regionIds } },
    orderBy: { label: "asc" },
  });
