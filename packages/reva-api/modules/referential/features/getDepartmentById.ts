import { Department } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getDepartmentById = ({
  id,
}: {
  id: string;
}): Promise<Department | null> =>
  prismaClient.department.findUnique({ where: { id } });
