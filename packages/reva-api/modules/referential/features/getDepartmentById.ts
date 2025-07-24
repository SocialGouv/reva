import { prismaClient } from "@/prisma/client";

export const getDepartmentById = ({ id }: { id?: string }) =>
  id ? prismaClient.department.findUnique({ where: { id } }) : null;
