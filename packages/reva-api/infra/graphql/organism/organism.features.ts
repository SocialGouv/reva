import { prismaClient } from "../../database/postgres/client";

export const getOrganismOnDepartmentsByOrganismAndDepartmentIds = ({
  organismAndDepartmentIds,
}: {
  organismAndDepartmentIds: { organismId: string; departmentId?: string }[];
}) =>
  prismaClient.organismsOnDepartments.findMany({
    where: { OR: organismAndDepartmentIds },
  });
