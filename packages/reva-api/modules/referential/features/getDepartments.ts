import { prismaClient } from "../../../prisma/client";

export const getDepartments = () =>
  prismaClient.department.findMany({ orderBy: [{ label: "asc" }] });
