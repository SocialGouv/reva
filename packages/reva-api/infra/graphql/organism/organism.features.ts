import { prismaClient } from "../../database/postgres/client";

export const getOrganismOnDepartmentsByOrganismIdAndDepartmentId = ({
  organismId,
  departmentId,
}: {
  organismId: string;
  departmentId?: string;
}) => {
  const whereClause = departmentId
    ? { departmentId, organismId }
    : { organismId };
  return prismaClient.organismsOnDepartments.findMany({
    where: whereClause,
  });
};
